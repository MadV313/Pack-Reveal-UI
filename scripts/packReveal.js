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
          window.location.href = 'https://madv313.github.io/Card-Collection-UI/';
        }
      }, 1000);

      closeBtn.addEventListener('click', () => {
        window.location.href = 'https://madv313.github.io/HUB-UI/';
      });
    });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function generateMockPack() {
    const allCards = [
      { card_id: "#017", name: "USG-45", rarity: "Rare", filename: "017_USG45_Attack.png", isNew: Math.random() < 0.5 },
      { card_id: "#126", name: "Lt. Col. Emil Borén", rarity: "Legendary", filename: "126_Lt.Col.EmilBorén_Specialty.png", isNew: Math.random() < 0.5 },
      { card_id: "#001", name: "M4-A1", rarity: "Rare", filename: "001_M4A1_Attack.png", isNew: Math.random() < 0.5 },
      { card_id: "#061", name: "Binoculars", rarity: "Rare", filename: "061_Binoculars_Tactical.png", isNew: Math.random() < 0.5 },
      { card_id: "#042", name: "Tactical Shirt", rarity: "Common", filename: "042_TacticalShirt_Defense.png", isNew: Math.random() < 0.5 },
      { card_id: "#079", name: "Box of Nails", rarity: "Rare", filename: "079_BoxofNails_Loot.png", isNew: Math.random() < 0.5 },
      { card_id: "#077", name: "MRE", rarity: "Common", filename: "077_MRE_Loot.png", isNew: Math.random() < 0.5 },
      { card_id: "#023", name: "AK-74", rarity: "Rare", filename: "023_AK74_Attack.png", isNew: Math.random() < 0.5 },
      { card_id: "#032", name: "Ballistic Helmet", rarity: "Uncommon", filename: "032_BallisticHelmet_Defense.png", isNew: Math.random() < 0.5 },
      { card_id: "#033", name: "Assault Helmet", rarity: "Uncommon", filename: "033_AssaultHelmet_Defense.png", isNew: Math.random() < 0.5 },
      { card_id: "#114", name: "Explosive Grenade Trap", rarity: "Common", filename: "114_ExplosiveGrenadeTrap_Trap.png", isNew: Math.random() < 0.5 },
      { card_id: "#110", name: "Perimeter Trap", rarity: "Common", filename: "110_PerimeterTrap_Trap.png", isNew: Math.random() < 0.5 },
      { card_id: "#047", name: "Riders Jacket", rarity: "Rare", filename: "047_RidersJacket_Defense.png", isNew: Math.random() < 0.5 },
      { card_id: "#125", name: "Elena Kovak", rarity: "Legendary", filename: "125_ElenaKovak_Specialty.png", isNew: Math.random() < 0.5 },
      { card_id: "#058", name: "Boonie Hat", rarity: "Rare", filename: "058_BoonieHat_Defense.png", isNew: Math.random() < 0.5 },
      { card_id: "#096", name: "Hazmat Infected", rarity: "Uncommon", filename: "096_HazmatInfected_Infected.png", isNew: Math.random() < 0.5 },
      { card_id: "#098", name: "Hunter Infected", rarity: "Uncommon", filename: "098_HunterInfected_Infected.png", isNew: Math.random() < 0.5 },
      { card_id: "#043", name: "Paramedic Jacket", rarity: "Uncommon", filename: "043_ParamedicJacket_Defense.png", isNew: Math.random() < 0.5 },
      { card_id: "#045", name: "Firefighter Pants", rarity: "Common", filename: "045_FirefighterPants_Defense.png", isNew: Math.random() < 0.5 },
      { card_id: "#083", name: "Box of Ammo", rarity: "Common", filename: "083_BoxofAmmo_Loot.png", isNew: Math.random() < 0.5 },
      { card_id: "#036", name: "NBC Suit", rarity: "Common", filename: "036_NBCSuit_Defense.png", isNew: Math.random() < 0.5 },
      { card_id: "#108", name: "Landmine", rarity: "Rare", filename: "108_Landmine_Trap.png", isNew: Math.random() < 0.5 },
      { card_id: "#081", name: "Dynamite", rarity: "Rare", filename: "081_Dynamite_Loot.png", isNew: Math.random() < 0.5 },
      { card_id: "#019", name: "KA-74", rarity: "Uncommon", filename: "019_KA74_Attack.png", isNew: Math.random() < 0.5 },
      { card_id: "#000", name: "WinterLand Death Deck (Face-Down)", rarity: "Unique", filename: "000_WinterlandDeathDeck_Back.png", isNew: Math.random() < 0.5 },
      { card_id: "#049", name: "Tracksuit Jacket", rarity: "Uncommon", filename: "049_TracksuitJacket_Defense.png", isNew: Math.random() < 0.5 },
      { card_id: "#066", name: "Headtorch", rarity: "Rare", filename: "066_Headtorch_Tactical.png", isNew: Math.random() < 0.5 },
      { card_id: "#025", name: "SG5-K", rarity: "Common", filename: "025_SG5K_Attack.png", isNew: Math.random() < 0.5 },
      { card_id: "#089", name: "Sewing Kit", rarity: "Rare", filename: "089_SewingKit_Loot.png", isNew: Math.random() < 0.5 },
      { card_id: "#088", name: "Cooking Pot", rarity: "Common", filename: "088_CookingPot_Loot.png", isNew: Math.random() < 0.5 }
    ];

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
