const packPath = '/data/mockPackReveal.json'; // Adjust if located elsewhere

const rarityClasses = {
  Common: 'border-common',
  Uncommon: 'border-uncommon',
  Rare: 'border-rare',
  Legendary: 'border-legendary' // Will now glow and pulse via CSS
};

function renderPackReveal(data) {
  const container = document.getElementById('card-reveal-container');
  const toast = document.getElementById('toast-message');
  let newUnlockShown = false;

  const cards = data.cards;

  cards.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card-slot slide-in';
    cardDiv.style.animationDelay = `${index * 1}s`;

    const cardBack = document.createElement('img');
    cardBack.src = 'images/cards/000_WinterlandDeathDeck_Back.png';
    cardBack.className = 'card-img card-back';
    cardDiv.appendChild(cardBack);
    container.appendChild(cardDiv);

    setTimeout(() => {
      cardBack.classList.add('flip-out');

      const faceImg = document.createElement('img');
      faceImg.src = `images/cards/${card.filename}`;
      faceImg.className = `card-img ${rarityClasses[card.rarity] || ''}`;
      cardDiv.appendChild(faceImg);

      if (card.newUnlock && !newUnlockShown) {
        toast.textContent = `New card unlocked: ${card.cardId}`;
        toast.style.opacity = 1;
        newUnlockShown = true;
        setTimeout(() => (toast.style.opacity = 0), 3000);
      }
    }, 1000 * (index + 1));
  });

  const countdown = document.getElementById('countdown');
  let seconds = data.autoCloseIn || 10;
  countdown.textContent = `Closing in ${seconds}s`;

  const timer = setInterval(() => {
    seconds--;
    countdown.textContent = `Closing in ${seconds}s`;
    if (seconds <= 0) {
      clearInterval(timer);
      window.location.href = '/collection.html';
    }
  }, 1000);
}

fetch(packPath)
  .then(res => res.json())
  .then(data => renderPackReveal(data))
  .catch(err => {
    console.error("Failed to load pack reveal data:", err);
    document.getElementById('spectator-status').textContent = 'Error loading pack.';
});
