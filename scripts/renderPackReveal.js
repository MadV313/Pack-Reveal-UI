// scripts/renderPackReveal.js

async function renderPackReveal() {
  const container = document.getElementById('cardContainer');
  const toast = document.getElementById('toast');
  const countdown = document.getElementById('countdown');
  const closeBtn = document.getElementById('closeBtn');
  const title = document.getElementById('reveal-title');

  try {
    const res = await fetch('data/mock_pack_reveal.json');
    const data = await res.json();

    title.textContent = data.title || 'New Card Pack Unlocked!';
    let delay = 0;

    data.cards.forEach((card, index) => {
      const cardDiv = document.createElement('div');
      cardDiv.classList.add('card-slot');
      cardDiv.style.animationDelay = `${index * 1}s`;

      // Card back image (corrected path)
      const cardBack = document.createElement('img');
      cardBack.src = 'images/cards/000_CardBack_Unique.png';
      cardBack.className = 'card-img card-back';
      cardDiv.appendChild(cardBack);
      container.appendChild(cardDiv);

      // Flip to face image
      setTimeout(() => {
        cardBack.classList.add('flip-out');

        const faceImg = document.createElement('img');
        faceImg.src = `images/cards/${card.filename}`;
        faceImg.className = `card-img border-${card.rarity.toLowerCase()}`;
        cardDiv.appendChild(faceImg);

        // "New!" badge + toast
        if (card.newUnlock) {
          const badge = document.createElement('span');
          badge.classList.add('new-unlock');
          badge.textContent = 'New!';
          cardDiv.appendChild(badge);

          toast.textContent = `New card unlocked: ${card.cardId}`;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 3000);
        }
      }, 1000 * (index + 1));
    });

    // Countdown timer
    let seconds = data.autoCloseIn || 10;
    countdown.textContent = `Closing in ${seconds}s...`;

    const timer = setInterval(() => {
      seconds--;
      countdown.textContent = `Closing in ${seconds}s...`;
      if (seconds <= 0) {
        clearInterval(timer);
        window.location.href = 'index.html';
      }
    }, 1000);

    // Manual close
    closeBtn.onclick = () => window.location.href = 'index.html';

  } catch (err) {
    console.error('Pack reveal load failed:', err);
    title.textContent = 'Failed to load card pack.';
  }
}

// Expose globally
window.renderPackReveal = renderPackReveal;
