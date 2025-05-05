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

      // Card back image
      const cardBack = document.createElement('img');
      cardBack.src = 'images/cards/000_CardBack_Unique.png';
      cardBack.className = 'card-img card-back';
      cardDiv.appendChild(cardBack);

      // Card face image, starts hidden
      const faceImg = document.createElement('img');
      faceImg.src = `images/cards/${card.filename}`;
      faceImg.className = `card-img border-${card.rarity.toLowerCase()}`;
      faceImg.style.opacity = '0';
      faceImg.style.transform = 'rotateY(90deg)';
      faceImg.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
      cardDiv.appendChild(faceImg);

      container.appendChild(cardDiv);

      // Flip animation timing
      setTimeout(() => {
        cardBack.classList.add('flip-out');

        setTimeout(() => {
          faceImg.style.opacity = '1';
          faceImg.style.transform = 'rotateY(0deg)';
        }, 600); // Slight delay after back flip-out

        // New unlock badge and toast
        if (card.newUnlock) {
          const badge = document.createElement('span');
          badge.classList.add('new-unlock');
          badge.textContent = 'New!';
          cardDiv.appendChild(badge);

          toast.textContent = `New card unlocked: ${card.cardId}`;
          toast.classList.add('show');

          const isLastCard = index === data.cards.length - 1;
          const toastDuration = isLastCard ? 3000 : 1500;

          setTimeout(() => toast.classList.remove('show'), toastDuration);
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
        window.close(); // Closes the window or tab
      }
    }, 1000);

    // Redirect HUB button
    closeBtn.textContent = 'HUB';
    closeBtn.onclick = () => window.location.href = 'https://madv313.github.io/HUB-UI/';

  } catch (err) {
    console.error('Pack reveal load failed:', err);
    title.textContent = 'Failed to load card pack.';
  }
}

window.renderPackReveal = renderPackReveal;
