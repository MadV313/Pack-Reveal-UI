// packreveal.js
// Frontend for Pack Reveal UI
// Enhancements:
//  • Accepts ?token= (preferred) or ?uid=
//  • Accepts ?api= and fetches from backend when provided
//  • Graceful fallback to static JSON when no API or token is available
//  • Redirects to Card-Collection-UI with token & api when known
//  • Forwards &new=###,### and &ts=... to Collection so it can highlight new cards
//  • FIX: token-first reveal (no silent uid fallback when token exists) + cache-bust
//  • FIX: honor incoming ?next= for deterministic handoff back to Collection UI

const USE_MOCK_MODE = false; // Set to true to force local mock

async function packReveal() {
  const urlParams   = new URLSearchParams(window.location.search);
  const token       = urlParams.get('token');             // preferred
  const uid         = urlParams.get('uid');               // legacy
  const apiBase     = urlParams.get('api');               // backend base (optional)
  const nextParam   = urlParams.get('next') || '';        // explicit handoff target (from /buycard)
  const container   = document.getElementById('cardContainer');
  const countdownEl = document.getElementById('countdown');
  const closeBtn    = document.getElementById('closeBtn');
  const toast       = document.getElementById('toast');
  const title       = document.getElementById('reveal-title');

  if (!token && !uid) {
    console.error('Missing token/uid in URL. Cannot load reveal.');
    document.body.innerHTML = '<h2 style="color: white;">Error: Missing User ID</h2>';
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'fadeOverlay';
  document.body.appendChild(overlay);

  const entranceEffect = document.createElement('div');
  entranceEffect.id = 'cardEntranceEffect';
  entranceEffect.innerHTML = `
    <img src="images/cards/000_CardBack_Unique.png" class="card-back-glow-effect" />
  `;
  document.body.appendChild(entranceEffect);

  const cards = await fetchCards({ token, uid, apiBase, titleEl: title });

  // Build the list of newly unlocked numeric IDs (without '#') for Collection highlighting
  const newIds = (Array.isArray(cards) ? cards : [])
    .filter(c => c && (c.isNew === true || c.isNew === 'true'))
    .map(c => String(c.card_id || '').replace('#', ''))
    .filter(Boolean);

  // Store brief “recent unlocks” payload for downstream UIs if they want it
  try {
    localStorage.setItem(
      'recentUnlocks',
      JSON.stringify(
        (cards || []).map(c => ({
          cardId:  c.card_id,
          filename: c.filename,
          rarity:  c.rarity,
          isNew:   c.isNew,
          owned:   Number(c.owned ?? 1) || 1,
          number:  c.card_id?.replace('#', '') || '',
          name:    c.name || ''
        }))
      )
    );
  } catch {}

  // Entrance animation → then render / flip each card
  setTimeout(() => {
    entranceEffect.classList.add('fade-out');
    setTimeout(() => {
      entranceEffect.remove();
      container.innerHTML = '';
      const flipQueue = [];

      (cards || []).forEach((card, i) => {
        const cardSlot = document.createElement('div');
        cardSlot.className = 'card-slot drop-in';
        cardSlot.style.animationDelay = `${i * 1}s`;

        const back = document.createElement('img');
        back.src = 'images/cards/000_CardBack_Unique.png';
        back.className = 'card-img card-back';

        const front = document.createElement('img');
        front.src = `images/cards/${card.filename}`;
        front.className = `card-img ${getRarityClass(card.rarity)}`;
        if ((card.rarity || '').toLowerCase() === 'legendary') {
          front.classList.add('shimmer');
        }
        front.style.opacity = '0';
        front.style.transform = 'rotateY(90deg)';
        front.style.transition = 'transform 0.8s ease, opacity 0.8s ease';

        if (card.isNew) {
          const badge = document.createElement('div');
          badge.className = 'new-unlock';
          badge.textContent = 'New!';
          cardSlot.appendChild(badge);
        }

        cardSlot.appendChild(back);
        cardSlot.appendChild(front);
        container.appendChild(cardSlot);

        flipQueue.push(() => {
          setTimeout(() => {
            back.classList.add('flip-out');
            setTimeout(() => {
              front.style.opacity = '1';
              front.style.transform = 'rotateY(0deg)';
            }, 500);
            if (card.isNew) showToast(`New card unlocked: ${card.name}`);
          }, 1000 + i * 1000);
        });
      });

      container.classList.add('show');
      title.textContent = (cards && cards.length)
        ? 'New Card Pack Unlocked!'
        : 'No cards found.';
      flipQueue.forEach(fn => fn());
    }, 1500);
  }, 2500);

  // Countdown to auto-close → go to Collection UI when we know token/api
  let countdown = 16;
  const interval = setInterval(() => {
    countdownEl.textContent = `Closing in ${countdown--}s`;
    if (countdown === 1) overlay.classList.add('fade-in');
    if (countdown < 0) {
      clearInterval(interval);
      setTimeout(() => {
        window.location.href = buildCollectionUrl({ token, apiBase, newIds, next: nextParam });
      }, 200);
    }
  }, 1000);

  // Close button → HUB or Collection, prefer explicit next/Collection if token available
  closeBtn.addEventListener('click', () => {
    const collUrl = buildCollectionUrl({ token, apiBase, newIds, next: nextParam });
    if (collUrl.includes('token=')) {
      window.location.href = collUrl;
    } else {
      window.location.href = 'https://madv313.github.io/HUB-UI/';
    }
  });

  /* ───────────────────────── helpers ───────────────────────── */

  function buildCollectionUrl({ token, apiBase, newIds, next }) {
    // If /buycard provided an explicit ?next=, honor it and just add a fresh ts
    if (next) {
      try {
        const u = new URL(next, window.location.href);
        u.searchParams.set('ts', String(Date.now()));
        return u.toString();
      } catch {
        // fall through to manual build if next was malformed
      }
    }

    const base = 'https://madv313.github.io/Card-Collection-UI';
    const ts   = Date.now();
    const qp = new URLSearchParams();
    if (token) qp.set('token', token);
    if (apiBase) qp.set('api', apiBase);
    qp.set('fromPackReveal', 'true');
    if (Array.isArray(newIds) && newIds.length) qp.set('new', newIds.join(','));
    qp.set('ts', String(ts));
    return `${base}/?${qp.toString()}`;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show', 'pulse');
    setTimeout(() => toast.classList.remove('show', 'pulse'), 3500);
  }

  function getRarityClass(rarity) {
    switch ((rarity || '').toLowerCase()) {
      case 'common':    return 'border-common';
      case 'uncommon':  return 'border-uncommon';
      case 'rare':      return 'border-rare';
      case 'legendary': return 'border-legendary';
      case 'unique':    return 'border-unique';
      default:          return '';
    }
  }

  /**
   * Fetch reveal cards for this opening, preferring the backend when available.
   * Order of attempts:
   *  1) <api>/packReveal/reveal?token=...        (token-first)
   *  2) <api>/packReveal/reveal?uid=...          (only if NO token)
   *  3) data/reveal_<token>.json?ts=...          (static, token-first)
   *  4) data/reveal_<uid>.json?ts=...            (static, only if NO token)
   *  5) data/mock_pack_reveal.json?ts=...        (dev fallback)
   */
  async function fetchCards({ token, uid, apiBase, titleEl }) {
    const tryFetch = async (url, label) => {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`${label} failed: ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.cards || []);
      if (json.title && titleEl) titleEl.textContent = json.title;
      return arr;
    };

    const ts = Date.now();
    const api = apiBase ? apiBase.replace(/\/+$/, '') : '';

    try {
      if (USE_MOCK_MODE) throw new Error('mock mode');

      // TOKEN-FIRST: if token exists, do NOT silently fall back to uid
      if (api && token) {
        return await tryFetch(`${api}/packReveal/reveal?token=${encodeURIComponent(token)}&ts=${ts}`, 'API(token)');
      }
      if (!token && api && uid) {
        return await tryFetch(`${api}/packReveal/reveal?uid=${encodeURIComponent(uid)}&ts=${ts}`, 'API(uid)');
      }

      // Static token-first
      if (token) {
        return await tryFetch(`data/reveal_${encodeURIComponent(token)}.json?ts=${ts}`, 'Static(token)');
      }
      if (!token && uid) {
        return await tryFetch(`data/reveal_${encodeURIComponent(uid)}.json?ts=${ts}`, 'Static(uid)');
      }

      throw new Error('no source available');
    } catch (e1) {
      console.warn('Primary fetch failed:', e1?.message || e1);

      // If token was present, do NOT silently switch to uid file — that causes "repeat reveals"
      if (token) {
        try {
          return await tryFetch(`data/mock_pack_reveal.json?ts=${ts}`, 'Mock');
        } catch (e2) {
          console.error('All fetch attempts failed (token path):', e2?.message || e2);
          if (titleEl) titleEl.textContent = 'Failed to load card pack (token file missing).';
          return [];
        }
      }

      // No token: try uid static as last resort, then mock
      if (uid) {
        try {
          return await tryFetch(`data/reveal_${encodeURIComponent(uid)}.json?ts=${ts}`, 'Static(uid)');
        } catch (e2) {
          try {
            return await tryFetch(`data/mock_pack_reveal.json?ts=${ts}`, 'Mock');
          } catch (e3) {
            console.error('All fetch attempts failed (uid path):', e3?.message || e3);
            if (titleEl) titleEl.textContent = 'Failed to load card pack.';
            return [];
          }
        }
      }

      // Absolute last resort
      try {
        return await tryFetch(`data/mock_pack_reveal.json?ts=${ts}`, 'Mock');
      } catch {
        if (titleEl) titleEl.textContent = 'Failed to load card pack.';
        return [];
      }
    }
  }
}

packReveal();
