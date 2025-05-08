const USE_MOCK_MODE = true; // Set to false when backend is ready

async function packReveal() {
  const container = document.getElementById('cardContainer');
  const countdownEl = document.getElementById('countdown');
  const closeBtn = document.getElementById('closeBtn');
  const toast = document.getElementById('toast');

  // Fade overlay
  const overlay = document.createElement('div');
  overlay.id = 'fadeOverlay';
  document.body.appendChild(overlay);

  // Glowing intro card
  const entranceEffect = document.createElement('div');
  entranceEffect.id = 'cardEntranceEffect';
  entranceEffect.innerHTML = `
    <img src="images/cards/000_CardBack_Unique.png" class="card-back-glow-effect" />
  `;
  document.body.appendChild(entranceEffect);

  const cards = USE_MOCK_MODE ? generateMockPack() : await fetchCards();

  // Store reveal data in localStorage
  localStorage.setItem("recentUnlocks", JSON.stringify(
    cards.map(c => ({
      cardId: c.card_id,
      filename: c.filename,
      rarity: c.rarity,
      isNew: true,
      owned: 1,
      number: c.card_id?.replace('#', '') || '',
      name: c.name || ''
    }))
  ));

  // Show cards after intro
  setTimeout(() => {
    entranceEffect.classList.add('fade-out');
    setTimeout(() => {
      entranceEffect.remove();
      container.innerHTML = '';
      const flipQueue = [];

      cards.forEach((card, i) => {
        const cardSlot = document.createElement('div');
        cardSlot.className = 'card-slot drop-in';

        const back = document.createElement('img');
        back.src = 'images/cards/000_CardBack_Unique.png';
        back.className = 'card-img card-back';

        const front = document.createElement('img');
        front.src = `images/cards/${card.filename}`;
        front.className = `card-img ${getRarityClass(card.rarity)}`;
        if (card.rarity.toLowerCase() === 'legendary') {
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
      flipQueue.forEach(fn => fn());
    }, 1500);
  }, 2500);

  // Countdown logic
  let countdown = 13;
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
    switch (rarity.toLowerCase()) {
      case 'common': return 'border-common';
      case 'uncommon': return 'border-uncommon';
      case 'rare': return 'border-rare';
      case 'legendary': return 'border-legendary';
      case 'unique': return 'border-unique';
      default: return '';
    }
  }

  async function fetchCards() {
    try {
      const res = await fetch('/packReveal');
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.slice(0, 3);
    } catch {
      console.warn('Backend unavailable — loading mock JSON');
      const fallback = await fetch('data/mock_pack_reveal.json');
      return await fallback.json();
    }
  }

  function generateMockPack() {
    const allCards = [
      { card_id: "#017", name: "USG-45", rarity: "Rare", filename: "017_USG45_Attack.png" },
      { card_id: "#126", name: "Lt. Col. Emil Borén", rarity: "Legendary", filename: "126_Lt.Col.EmilBoren_Specialty.png" },
      { card_id: "#036", name: "NBC Suit", rarity: "Common", filename: "036_NBCSuit_Defense.png" },
    ];
    return allCards.map(c => ({ ...c, isNew: true, owned: 1 }));
  }
}

packReveal();
