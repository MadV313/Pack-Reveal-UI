// packReveal.js

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('cardContainer');
  const countdownEl = document.getElementById('countdown');
  const closeBtn = document.getElementById('closeBtn');
  const toast = document.getElementById('toast');

  try {
    const res = await fetch('/data/mock_pack_reveal.json');
    const cards = await res.json();

    // Fetch the actual card data from the CoreMasterReference or the weighted random logic
    const cardData = await fetchCards(); // Fetch cards from your weighted logic function

    // Shuffle or randomly select cards as needed
    const selectedCards = pickRandomCards(cardData, 3); // Picking 3 cards for the pack

    selectedCards.forEach((card, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'card-wrapper';

      const cardBack = document.createElement('img');
      cardBack.src = 'images/cards/000_WinterlandDeathDeck_Back.png';
      cardBack.className = 'card back';

      const cardFront = document.createElement('img');
      cardFront.src = `images/cards/${card.filename}`;
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

  // Fetch the card data from your CoreMasterReference file (or from a dynamic source)
  async function fetchCards() {
    const response = await fetch('/path/to/CoreMasterReference.json');
    const data = await response.json();
    return data.filter(card => card.card_id !== '000');  // Exclude placeholder cards
  }

  // Weighted random logic to pick N cards
  function pickRandomCards(cards, count) {
    const weightedPool = [];

    // Push the cards into the pool based on their rarity weight
    cards.forEach(card => {
      const weight = rarityWeights[card.rarity] || 1;
      for (let i = 0; i < weight; i++) {
        weightedPool.push(card);
      }
    });

    // Shuffle the weighted pool
    for (let i = weightedPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [weightedPool[i], weightedPool[j]] = [weightedPool[j], weightedPool[i]]; // Swap
    }

    // Return the selected number of cards
    return weightedPool.slice(0, count);
  }

  const rarityWeights = {
    Common: 5,
    Uncommon: 3,
    Rare: 2,
    Legendary: 1
  };
});
