function packReveal() {
  const container = document.getElementById('cardContainer');
  const countdownEl = document.getElementById('countdown');
  const closeBtn = document.getElementById('closeBtn');
  const toast = document.getElementById('toast');

  // Insert fade overlay
  const overlay = document.createElement('div');
  overlay.id = 'fadeOverlay';
  document.body.appendChild(overlay);

  // Insert pre-reveal glowing card
  const entranceEffect = document.createElement('div');
  entranceEffect.id = 'cardEntranceEffect';
  entranceEffect.innerHTML = `
    <img src="images/cards/000_CardBack_Unique.png" class="card-back-glow-effect" />
  `;
  document.body.appendChild(entranceEffect);

  let cards;

  fetch('/packReveal')
    .then((res) => res.ok ? res.json() : Promise.reject())
    .then((data) => {
      cards = data.slice(0, 3);
    })
    .catch(() => {
      console.warn('Backend unavailable — using mock pack');
      cards = generateMockPack();
    })
    .finally(() => {
      // Wait until entrance fades before showing cards
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

            let isActuallyNew = false;

            if (card.isNew) {
              isActuallyNew = true;
              const badge = document.createElement('div');
              badge.className = 'new-unlock';
              badge.textContent = 'New!';
              cardSlot.appendChild(badge);
            }

            cardSlot.appendChild(back);
            cardSlot.appendChild(front);
            container.appendChild(cardSlot);

            flipQueue.push(() => {
              ((thisBack, thisFront, newStatus, newName) => {
                setTimeout(() => {
                  thisBack.classList.add('flip-out');
                  setTimeout(() => {
                    thisFront.style.opacity = '1';
                    thisFront.style.transform = 'rotateY(0deg)';
                  }, 500);

                  if (newStatus) showToast(`New card unlocked: ${newName}`);
                }, 1000 + i * 1000);
              })(back, front, isActuallyNew, card.name);
            });
          });

          container.classList.add('show');
          flipQueue.forEach((fn) => fn());
        }, 1500); // entrance fade duration
      }, 2500); // entrance display duration

      let countdown = 12;
      const interval = setInterval(() => {
        countdownEl.textContent = `Closing in ${countdown--}s`;

        if (countdown === 3) {
          overlay.classList.add('fade-in');
        }

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

  function generateMockPack() {
    const allCards = [
      { card_id: "#017", name: "USG-45", rarity: "Rare", filename: "017_USG45_Attack.png" },
      { card_id: "#126", name: "Lt. Col. Emil Borén", rarity: "Legendary", filename: "126_Lt.Col.EmilBoren_Specialty.png" },
      { card_id: "#001", name: "M4-A1", rarity: "Rare", filename: "001_M4A1_Attack.png" },
      { card_id: "#061", name: "Binoculars", rarity: "Rare", filename: "061_Binoculars_Tactical.png" },
      { card_id: "#042", name: "Tactical Shirt", rarity: "Common", filename: "042_TacticalShirt_Defense.png" },
      { card_id: "#079", name: "Box of Nails", rarity: "Rare", filename: "079_BoxofNails_Loot.png" },
      { card_id: "#077", name: "MRE", rarity: "Common", filename: "077_MRE_Loot.png" },
      { card_id: "#023", name: "AK-74", rarity: "Rare", filename: "023_AK74_Attack.png" },
      { card_id: "#032", name: "Ballistic Helmet", rarity: "Uncommon", filename: "032_BallisticHelmet_Defense.png" },
      { card_id: "#033", name: "Assault Helmet", rarity: "Uncommon", filename: "033_AssaultHelmet_Defense.png" },
      { card_id: "#114", name: "Explosive Grenade Trap", rarity: "Common", filename: "114_ExplosiveGrenadeTrap_Trap.png" },
      { card_id: "#110", name: "Perimeter Trap", rarity: "Common", filename: "110_PerimeterTrap_Trap.png" },
      { card_id: "#047", name: "Riders Jacket", rarity: "Rare", filename: "047_RidersJacket_Defense.png" },
      { card_id: "#125", name: "Elena Kovak", rarity: "Legendary", filename: "125_ElenaKovak_Specialty.png" },
      { card_id: "#058", name: "Boonie Hat", rarity: "Rare", filename: "058_BoonieHat_Defense.png" },
      { card_id: "#096", name: "Hazmat Infected", rarity: "Uncommon", filename: "096_HazmatInfected_Infected.png" },
      { card_id: "#098", name: "Hunter Infected", rarity: "Uncommon", filename: "098_HunterInfected_Infected.png" },
      { card_id: "#043", name: "Paramedic Jacket", rarity: "Uncommon", filename: "043_ParamedicJacket_Defense.png" },
      { card_id: "#045", name: "Firefighter Pants", rarity: "Common", filename: "045_FirefighterPants_Defense.png" },
      { card_id: "#083", name: "Box of Ammo", rarity: "Common", filename: "083_BoxofAmmo_Loot.png" },
      { card_id: "#036", name: "NBC Suit", rarity: "Common", filename: "036_NBCSuit_Defense.png" },
      { card_id: "#108", name: "Landmine", rarity: "Rare", filename: "108_Landmine_Trap.png" },
      { card_id: "#081", name: "Dynamite", rarity: "Rare", filename: "081_Dynamite_Loot.png" },
      { card_id: "#019", name: "KA-74", rarity: "Uncommon", filename: "019_KA74_Attack.png" },
      { card_id: "#049", name: "Tracksuit Jacket", rarity: "Uncommon", filename: "049_TracksuitJacket_Defense.png" },
      { card_id: "#066", name: "Headtorch", rarity: "Rare", filename: "066_Headtorch_Tactical.png" },
      { card_id: "#025", name: "SG5-K", rarity: "Common", filename: "025_SG5K_Attack.png" },
      { card_id: "#089", name: "Sewing Kit", rarity: "Rare", filename: "089_SewingKit_Loot.png" },
      { card_id: "#088", name: "Cooking Pot", rarity: "Common", filename: "088_CookingPot_Loot.png" }
    ].filter(card => card.card_id !== "#000");

    const rarityWeights = {
      Common: 5,
      Uncommon: 3,
      Rare: 2,
      Legendary: 1
    };

    function weightedRandomCard() {
      const pool = [];
      allCards.forEach(card => {
        const weight = rarityWeights[card.rarity] || 1;
        for (let i = 0; i < weight; i++) {
          pool.push(card);
        }
      });

      const chosen = structuredClone(pool[Math.floor(Math.random() * pool.length)]);
      chosen.isNew = Math.random() < 0.5;
      return chosen;
    }

    return [weightedRandomCard(), weightedRandomCard(), weightedRandomCard()];
  }
}

packReveal();
