export async function renderPackReveal() {
  const container = document.getElementById('cardContainer');
  const toast = document.getElementById('toast');
  const countdown = document.getElementById('countdown');
  const closeBtn = document.getElementById('closeBtn');
  const title = document.getElementById('reveal-title');

  try {
    const res = await fetch('data/mock_reveal_payload.json');
    const data = await res.json();

    title.textContent = data.title || 'New Card Pack Unlocked!';
    let delay = 0;

    data.cards.forEach((card, index) => {
      const cardDiv = document.createElement('div');
      cardDiv.classList.add('card', card.rarity.toLowerCase());

      const img = document.createElement('img');
      img.src = `images/cards/${card.cardId}.png`;
      img.alt = card.cardId;

      cardDiv.appendChild(img);
      cardDiv.style.animationDelay = `${delay}s`;
      delay += 1;

      if (card.newUnlock) {
        const badge = document.createElement('span');
        badge.classList.add('new-unlock');
        badge.textContent = 'New!';
        cardDiv.appendChild(badge);

        setTimeout(() => {
          toast.textContent = `New card unlocked: ${card.cardId}`;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 3000);
        }, delay * 1000);
      }

      container.appendChild(cardDiv);
    });

    let seconds = data.autoCloseIn || 10;
    const timer = setInterval(() => {
      countdown.textContent = `Closing in ${seconds--}s...`;
      if (seconds < 0) {
        clearInterval(timer);
        window.location.href = 'index.html'; // Or redirect to main UI
      }
    }, 1000);

    closeBtn.onclick = () => {
      window.location.href = 'index.html';
    };

  } catch (err) {
    console.error("Pack reveal failed to load:", err);
    title.textContent = "Failed to load card pack.";
  }
}
