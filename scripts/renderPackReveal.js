// scripts/renderPackReveal.js

async function renderPackReveal() {
  const container = document.getElementById('cardContainer');
  const toast = document.getElementById('toast');
  const countdown = document.getElementById('countdown');
  const closeBtn = document.getElementById('closeBtn');
  const title = document.getElementById('reveal-title');

  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');
  const fallbackUrl = 'data/mock_pack_reveal.json';
  const revealUrl = userId ? `data/reveal_${userId}.json` : fallbackUrl;

  try {
    const res = await fetch(revealUrl);
    if (!res.ok) throw new Error(`Reveal fetch failed (${res.status})`);

    const data = await res.json();
    const cards = data.cards || [];
    title.textContent = data.title || 'New Card Pack Unlocked!';
    container.classList.add('show');

    cards.forEach((card, index) => {
      const cardSlot = document.createElement('div');
      cardSlot.classList.add('card-slot');
      cardSlot.style.animationDelay = `${index * 1}s`;

      // Card back
      const cardBack = document.createElement('img');
      cardBack.src = 'images/cards/000_WinterlandDeathDeck_Back.png';
      cardBack.className = 'card-img card-back';
      cardSlot.appendChild(cardBack);

      // Card front
      const cardFront = document.createElement('img');
      cardFront.src = `images/cards/${card.filename}`;
      cardFront.className = `card-img border-${card.rarity?.toLowerCase() || 'common'}`;
      cardFront.style.opacity = '0';
      cardFront.style.transform = 'rotateY(90deg)';
      cardFront.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
      cardSlot.appendChild(cardFront);

      container.appendChild(cardSlot);

      setTimeout(() => {
        cardBack.classList.add('flip-out');
        setTimeout(() => {
          cardFront.style.opacity = '1';
          cardFront.style.transform = 'rotateY(0deg)';
        }, 500);

        if (card.isNew) {
          const badge = document.createElement('span');
          badge.className = 'new-unlock';
          badge.textContent = 'New!';
          cardSlot.appendChild(badge);

          toast.textContent = `New card unlocked: ${card.name}`;
          toast.classList.add('show', 'pulse');

          const isLast = index === cards.length - 1;
          setTimeout(() => toast.classList.remove('show', 'pulse'), isLast ? 3000 : 1500);
        }
      }, 1000 * (index + 1));
    });

    // Countdown
    let seconds = data.autoCloseIn || 10;
    countdown.textContent = `Closing in ${seconds}s...`;

    const timer = setInterval(() => {
      seconds--;
      countdown.textContent = `Closing in ${seconds}s...`;
      if (seconds <= 0) {
        clearInterval(timer);
        window.location.href = 'https://madv313.github.io/Card-Collection-UI/';
      }
    }, 1000);

    closeBtn.textContent = 'HUB';
    closeBtn.onclick = () => window.location.href = 'https://madv313.github.io/HUB-UI/';

  } catch (err) {
    console.error('❌ Pack reveal load failed, fallback engaged:', err);

    if (revealUrl !== fallbackUrl) {
      try {
        const res = await fetch(fallbackUrl);
        const data = await res.json();
        title.textContent = 'Fallback: Mock Pack Reveal';
        container.classList.add('show');
        renderCards(data.cards || []);
      } catch (fallbackErr) {
        title.textContent = 'Failed to load card pack.';
      }
    } else {
      title.textContent = 'Failed to load card pack.';
    }
  }

  function renderCards(cards) {
    cards.forEach((card, index) => {
      const cardSlot = document.createElement('div');
      cardSlot.classList.add('card-slot');
      cardSlot.style.animationDelay = `${index * 1}s`;

      const cardBack = document.createElement('img');
      cardBack.src = 'images/cards/000_WinterlandDeathDeck_Back.png';
      cardBack.className = 'card-img card-back';
      cardSlot.appendChild(cardBack);

      const cardFront = document.createElement('img');
      cardFront.src = `images/cards/${card.filename}`;
      cardFront.className = `card-img border-${card.rarity?.toLowerCase() || 'common'}`;
      cardFront.style.opacity = '0';
      cardFront.style.transform = 'rotateY(90deg)';
      cardFront.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
      cardSlot.appendChild(cardFront);

      container.appendChild(cardSlot);

      setTimeout(() => {
        cardBack.classList.add('flip-out');
        setTimeout(() => {
          cardFront.style.opacity = '1';
          cardFront.style.transform = 'rotateY(0deg)';
        }, 500);
      }, 1000 * (index + 1));
    });
  }
}

window.renderPackReveal = renderPackReveal;
