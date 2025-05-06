function packReveal() {
  const container = document.getElementById('cardContainer');
  const countdownEl = document.getElementById('countdown');
  const closeBtn = document.getElementById('closeBtn');
  const toast = document.getElementById('toast');

  let cards;

  // Try to fetch from backend, otherwise fall back to mock pack
  fetch('/packReveal')
    .then((res) => res.ok ? res.json() : Promise.reject())
    .then((data) => cards = data)
    .catch(() => {
      console.warn('Backend unavailable — using mock pack');
      cards = generateMockPack();
    })
    .finally(() => {
      cards.forEach((card, i) => {
        const cardSlot = document.createElement('div');
        cardSlot.className = 'card-slot';

        const back = document.createElement('img');
        back.src = 'images/cards/000_WinterlandDeathDeck_Back.png';
        back.className = 'card-img card-back';

        const front = document.createElement('img');
        front.src = `images/cards/${card.filename}`;
        front.className = `card-img border-${card.rarity.toLowerCase()}`;
        front.style.opacity = '0';
        front.style.transform = 'rotateY(90deg)';
        front.style.transition = 'transform 0.5s ease, opacity 0.5s ease';

        cardSlot.appendChild(back);
        cardSlot.appendChild(front);

        if (card.isNew) {
          const badge = document.createElement('div');
          badge.className = 'new-unlock';
          badge.textContent = 'New!';
          cardSlot.appendChild(badge);
        }

        container.appendChild(cardSlot);

        setTimeout(() => {
          back.classList.add('flip-out');
          setTimeout(() => {
            front.style.opacity = '1';
            front.style.transform = 'rotateY(0deg)';
          }, 500);

          if (card.isNew) showToast(`New card unlocked: ${card.name}`);
        }, 1000 + i * 1000);
      });

      // Countdown logic
      let countdown = 10;
      const interval = setInterval(() => {
        countdownEl.textContent = `Closing in ${countdown--}s`;
        if (countdown < 0) {
          clearInterval(interval);
          window.location.href = '/';
        }
      }, 1000);

      closeBtn.addEventListener('click', () => {
        window.location.href = '/';
      });
    });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function generateMockPack() {
    const allCards = [/* your 30-card list remains unchanged here */];

    // Pick 3 unique random cards
    const selected = [];
    while (selected.length < 3) {
      const card = allCards[Math.floor(Math.random() * allCards.length)];
      if (!selected.includes(card)) {
        selected.push(card);
      }
    }
    return selected;
  }
}

packReveal();
