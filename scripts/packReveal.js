const USE_MOCK_MODE = false; // Set to false when backend is ready

async function packReveal() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('uid');
  const container = document.getElementById('cardContainer');
  const countdownEl = document.getElementById('countdown');
  const closeBtn = document.getElementById('closeBtn');
  const toast = document.getElementById('toast');
  const title = document.getElementById('reveal-title');

  if (!userId) {
    console.error('Missing uid in URL. Cannot load reveal file.');
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

  const cards = await fetchCards(userId);

  localStorage.setItem("recentUnlocks", JSON.stringify(
    cards.map(c => ({
      cardId: c.card_id,
      filename: c.filename,
      rarity: c.rarity,
      isNew: c.isNew,
      owned: 1,
      number: c.card_id?.replace('#', '') || '',
      name: c.name || ''
    }))
  ));

  setTimeout(() => {
    entranceEffect.classList.add('fade-out');
    setTimeout(() => {
      entranceEffect.remove();
      container.innerHTML = '';
      const flipQueue = [];

      cards.forEach((card, i) => {
        const cardSlot = document.createElement('div');
        cardSlot.className = 'card-slot drop-in';
        cardSlot.style.animationDelay = `${i * 1}s`;

        const back = document.createElement('img');
        back.src = 'images/cards/000_CardBack_Unique.png';
        back.className = 'card-img card-back';

        const front = document.createElement('img');
        front.src = `images/cards/${card.filename}`;
        front.className = `card-img ${getRarityClass(card.rarity)}`;
        if (card.rarity?.toLowerCase() === 'legendary') {
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
      title.textContent = cards.length ? 'New Card Pack Unlocked!' : 'No cards found.';
      flipQueue.forEach(fn => fn());
    }, 1500);
  }, 2500);

  let countdown = 16;
  const interval = setInterval(() => {
    countdownEl.textContent = `Closing in ${countdown--}s`;
    if (countdown === 1) overlay.classList.add('fade-in');
    if (countdown < 0) {
      clearInterval(interval);
      setTimeout(() => {
        window.location.href = 'https://madv313.github.io/Card-Collection-UI/?fromPackReveal=true';
      }, 200);
    }
  }, 1000);

  closeBtn.addEventListener('click', () => {
    window.location.href = 'https://madv313.github.io/HUB-UI/';
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show', 'pulse');
    setTimeout(() => toast.classList.remove('show', 'pulse'), 3500);
  }

  function getRarityClass(rarity) {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'border-common';
      case 'uncommon': return 'border-uncommon';
      case 'rare': return 'border-rare';
      case 'legendary': return 'border-legendary';
      case 'unique': return 'border-unique';
      default: return '';
    }
  }

  async function fetchCards(uid) {
    const primaryUrl = `data/reveal_${uid}.json`;
    const fallbackUrl = 'data/mock_pack_reveal.json';

    try {
      const res = await fetch(primaryUrl);
      if (!res.ok) throw new Error(`Primary fetch failed (${res.status})`);
      const data = await res.json();
      if (data.title && title) title.textContent = data.title;
      return Array.isArray(data) ? data : data.cards || [];
    } catch {
      console.warn('⚠️ Reveal file not found. Trying fallback...');
      try {
        const res = await fetch(fallbackUrl);
        const data = await res.json();
        if (data.title && title) title.textContent = `Fallback: ${data.title}`;
        return data.cards || [];
      } catch {
        title.textContent = 'Failed to load card pack.';
        return [];
      }
    }
  }
}

packReveal();
