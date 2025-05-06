// packReveal.js

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('cardContainer');
  const countdownEl = document.getElementById('countdown');
  const closeBtn = document.getElementById('closeBtn');
  const toast = document.getElementById('toast');

  try {
    // Fetch the actual card data from the backend route /packReveal
    const res = await fetch('/packReveal');  // Corrected the path here
    const cards = await res.json();

    // Display the cards
    cards.forEach((card, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'card-wrapper';

      const cardBack = document.createElement('img');
      cardBack.src = 'images/cards/000_WinterlandDeathDeck_Back.png';  // Assuming the back image is static
      cardBack.className = 'card back';

      const cardFront = document.createElement('img');
      cardFront.src = `images/cards/${card.filename}`;  // Fetch the front image from the /images/cards directory
      cardFront.className = `card front rarity-${card.rarity.toLowerCase()}`;

      if (card.isNew) {
        const badge = document.createElement('div');
        badge.className = 'new-badge';
        badge.textContent = 'New!';
        wrapper.appendChild(badge);
      }

      wrapper.appendChild(cardBack);
      wrapper.appendChild(cardFront);
      container.appendChild(wrapper);

      setTimeout(() => {
        wrapper.classList.add('flip');
        if (card.isNew) {
          showToast(`New card unlocked: ${card.name}`);
        }
      }, 1000 + i * 1000); // staggered reveal
    });

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

  } catch (err) {
    console.error('Pack reveal failed:', err);
    container.innerHTML = '<p style="color:white;text-align:center;">Failed to load pack data.</p>';
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // Generate mock cards with randomized rarity and random "new card" status
  async function generateMockCards() {
    const res = await fetch('/path/to/CoreMasterReference.json');  // Assuming data is available
    const data = await res.json();

    const rarityWeights = {
      Common: 5,
      Uncommon: 3,
      Rare: 2,
      Legendary: 1
    };

    const allCards = data.filter(card => card.card_id !== '000');  // Exclude placeholder cards

    const weightedPool = [];
    allCards.forEach(card => {
      const weight = rarityWeights[card.rarity] || 1;
      for (let i = 0; i < weight; i++) {
        weightedPool.push(card);  // Push full card object
      }
    });

    for (let i = weightedPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [weightedPool[i], weightedPool[j]] = [weightedPool[j], weightedPool[i]];  // Shuffle
    }

    // Randomly mark cards as "new"
    const cardsToReturn = weightedPool.slice(0, 3);  // Always return 3 random cards for mock pack
    cardsToReturn.forEach(card => {
      card.isNew = Math.random() < 0.5;  // Randomly set isNew to true for about 50% of the cards
    });

    // Ensure the card image is from /images/cards and the filename is correct
    cardsToReturn.forEach(card => {
      card.filename = `${card.card_id}.png`;  // Assuming the filename is based on card_id
    });

    return cardsToReturn;
  }

});
