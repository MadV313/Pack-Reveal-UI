// packreveal.js
// Frontend for Pack Reveal UI
// Enhancements:
//  • Accepts ?token= (preferred) or ?uid=
//  • Accepts ?api= and fetches from backend when provided
//  • Graceful fallback to static JSON when no API or token is available
//  • Redirects to Card-Collection-UI with token & api when known

const USE_MOCK_MODE = false; // Set to true to force local mock

async function packReveal() {
  const urlParams   = new URLSearchParams(window.location.search);
  const token       = urlParams.get('token');             // preferred
  const uid         = urlParams.get('uid');               // legacy
  const apiBase     = urlParams.get('api');               // backend base (optional)
  const container   = document.getElementById('cardContainer');
  const countdownEl = document.getElementById('countdown');
  const closeBtn    = document.getElementById('closeBtn');
  const toast       = document.getElementById('toast');
  const title       = document.getElementById('reveal-title');

  // If neither token nor uid is present, we can't determine the player.
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

  const cards = await fetchCards({ token, uid, apiBase });

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
        window.location.href = buildCollectionUrl({ token, apiBase });
      }, 200);
    }
  }, 1000);

  // Close button → HUB or Collection, prefer Collection if token available
  closeBtn.addEventListener('click', () => {
    const collUrl = buildCollectionUrl({ token, apiBase });
    if (collUrl.includes('token=')) {
      window.location.href = collUrl;
    } else {
      window.location.href = 'https://madv313.github.io/HUB-UI/';
    }
  });

  /* ───────────────────────── helpers ───────────────────────── */

  function buildCollectionUrl({ token, apiBase }) {
    const base = 'https://madv313.github.io/Card-Collection-UI';
    if (token) {
      const apiQP = apiBase ? `&api=${encodeURIComponent(apiBase)}` : '';
      return `${base}/index.html?token=${encodeURIComponent(token)}${apiQP}&fromPackReveal=true`;
    }
    // Fallback if we don’t know a token yet
    return `${base}/?fromPackReveal=true`;
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
   *  1) <api>/packReveal/reveal?token=...
   *  2) <api>/packReveal/reveal?uid=...
   *  3) data/reveal_<token>.json (static, when token is present)
   *  4) data/reveal_<uid>.json (static, legacy)
   *  5) data/mock_pack_reveal.json (dev fallback)
   */
  async function fetchCards({ token, uid, apiBase }) {
    const tryFetch = async (url, label) => {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`${label} failed: ${res.status}`);
      const json = await res.json();
      // Support array form or {cards: []}
      const arr = Array.isArray(json) ? json : (json.cards || []);
      if (json.title && title) title.textContent = json.title;
      return arr;
    };

    try {
      if (USE_MOCK_MODE) throw new Error('mock mode');

      // Prefer backend when apiBase is provided
      if (apiBase && token) {
        return await tryFetch(
          `${apiBase.replace(/\/+$/, '')}/packReveal/reveal?token=${encodeURIComponent(token)}`,
          'API(token)'
        );
      }
      if (apiBase && uid) {
        return await tryFetch(
          `${apiBase.replace(/\/+$/, '')}/packReveal/reveal?uid=${encodeURIComponent(uid)}`,
          'API(uid)'
        );
      }

      // Static fallbacks
      if (token) {
        return await tryFetch(`data/reveal_${encodeURIComponent(token)}.json`, 'Static(token)');
      }
      if (uid) {
        return await tryFetch(`data/reveal_${encodeURIComponent(uid)}.json`, 'Static(uid)');
      }

      throw new Error('no source available');
    } catch (e1) {
      console.warn('Primary fetch failed:', e1?.message || e1);
      // Final fallback to mock (dev)
      try {
        return await tryFetch('data/mock_pack_reveal.json', 'Mock');
      } catch (e2) {
        console.error('All fetch attempts failed:', e2?.message || e2);
        title.textContent = 'Failed to load card pack.';
        return [];
      }
    }
  }
}

packReveal();
