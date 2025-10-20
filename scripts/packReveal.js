// scripts/packReveal.js

// ───────────────── anti-stale hardeners ─────────────────
(function hardDisableSWAndBFCache() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(regs => Promise.allSettled(regs.map(r => r.unregister().catch(()=>{}))))
      .catch(()=>{});
  }
  // If returning from bfcache, force a fresh render
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) location.reload();
  });
})();

// Frontend for Pack Reveal UI (hardened fetching + bulletproof redirect)
//
// Key changes:
//  • Token-first, API-first (with cache-buster).
//  • If API route /packReveal/reveal is missing, try API-hosted static JSON
//    (/public/data/reveal_<token>.json then /data/reveal_<token>.json)
//    before falling back to local static assets.
//  • Always forward token, api, new, ts (and honor &next= if provided).
//  • Clear source logging to diagnose “same 3 cards” issues.
//
// Visuals/flow are unchanged.

const USE_MOCK_MODE = false; // set true only for local dev

async function packReveal() {
  const qs         = new URLSearchParams(location.search);
  const token      = qs.get("token") || "";
  const uid        = qs.get("uid")   || "";
  const apiBaseRaw = qs.get("api")   || "";
  const nextUrl    = qs.get("next")  || ""; // optional handoff override
  const apiBase    = apiBaseRaw.replace(/\/+$/, "");
  const container  = document.getElementById("cardContainer");
  const countdownEl= document.getElementById("countdown");
  const closeBtn   = document.getElementById("closeBtn");
  const toast      = document.getElementById("toast");
  const title      = document.getElementById("reveal-title");

  if (!token && !uid) {
    console.error("[packreveal] Missing token/uid in URL. Cannot load reveal.");
    document.body.innerHTML = '<h2 style="color: white;">Error: Missing User ID</h2>';
    return;
  }

  // One-shot image cache-buster for this page view
  const IMG_TS = Date.now();

  // Overlay + entrance flourish
  const overlay = document.createElement("div");
  overlay.id = "fadeOverlay";
  document.body.appendChild(overlay);

  const entranceEffect = document.createElement("div");
  entranceEffect.id = "cardEntranceEffect";
  entranceEffect.innerHTML = `<img src="images/cards/000_CardBack_Unique.png?ts=${IMG_TS}" class="card-back-glow-effect" />`;
  document.body.appendChild(entranceEffect);

  // ---- Fetch reveal (API-first, no-cache) ----
  const cards = await fetchCards({ token, uid, apiBase });

  // Build list of new ids (###) for Collection highlighting
  const newIds = (Array.isArray(cards) ? cards : [])
    .filter(c => c && (c.isNew === true || c.isNew === "true"))
    .map(c => String(c.card_id || "").replace("#", ""))
    .filter(Boolean);

  // Save a small “recent unlocks” record (optional downstream use)
  try {
    localStorage.setItem("recentUnlocks", JSON.stringify(
      (cards || []).map(c => ({
        cardId:  c.card_id,
        filename:c.filename,
        rarity:  c.rarity,
        isNew:   !!c.isNew,
        owned:   Number(c.owned ?? 1) || 1,
        number:  (c.card_id || "").replace("#", ""),
        name:    c.name || ""
      }))
    ));
  } catch {}

  // ---- Entrance animation then flip ----
  setTimeout(() => {
    entranceEffect.classList.add("fade-out");
    setTimeout(() => {
      entranceEffect.remove();
      container.innerHTML = "";

      const flipQueue = [];
      (cards || []).forEach((card, i) => {
        const slot = document.createElement("div");
        slot.className = "card-slot drop-in";
        slot.style.animationDelay = `${i * 1}s`;

        const back = document.createElement("img");
        back.src = `images/cards/000_CardBack_Unique.png?ts=${IMG_TS}`;
        back.className = "card-img card-back";

        const front = document.createElement("img");
        // keep using provided filename; card collection UI handles fallbacks
        front.src = `images/cards/${card.filename}?ts=${IMG_TS}`;
        front.className = `card-img ${rarityClass(card.rarity)}`;
        if ((card.rarity || "").toLowerCase() === "legendary") {
          front.classList.add("shimmer");
        }
        front.style.opacity = "0";
        front.style.transform = "rotateY(90deg)";
        front.style.transition = "transform 0.8s ease, opacity 0.8s ease";

        if (card.isNew) {
          const badge = document.createElement("div");
          badge.className = "new-unlock";
          badge.textContent = "New!";
          slot.appendChild(badge);
        }

        slot.appendChild(back);
        slot.appendChild(front);
        container.appendChild(slot);

        flipQueue.push(() => {
          setTimeout(() => {
            back.classList.add("flip-out");
            setTimeout(() => {
              front.style.opacity = "1";
              front.style.transform = "rotateY(0deg)";
            }, 500);
            if (card.isNew) showToast(`New card unlocked: ${card.name}`);
          }, 1000 + i * 1000);
        });
      });

      container.classList.add("show");
      title.textContent = (cards && cards.length) ? "New Card Pack Unlocked!" : "No cards found.";
      flipQueue.forEach(fn => fn());
    }, 1500);
  }, 2500);

  // ---- Auto-close → Collection (honor &next= when present) ----
  let countdown = 16;
  const t = setInterval(() => {
    countdownEl.textContent = `Closing in ${countdown--}s`;
    if (countdown === 1) overlay.classList.add("fade-in");
    if (countdown < 0) {
      clearInterval(t);
      setTimeout(() => {
        const handoff = buildNextUrl({ nextUrl, token, apiBase, newIds });
        location.href = handoff;
      }, 200);
    }
  }, 1000);

  // Close button → same handoff
  closeBtn.addEventListener("click", () => {
    const handoff = buildNextUrl({ nextUrl, token, apiBase, newIds });
    location.href = handoff;
  });

  /* ───────────── helpers ───────────── */

  function rarityClass(r) {
    switch ((r || "").toLowerCase()) {
      case "common":    return "border-common";
      case "uncommon":  return "border-uncommon";
      case "rare":      return "border-rare";
      case "legendary": return "border-legendary";
      case "unique":    return "border-unique";
      default:          return "";
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show", "pulse");
    setTimeout(() => toast.classList.remove("show", "pulse"), 3500);
  }

  // Build collection URL. If a fully-formed &next= exists, prefer that and only
  // append ts/new if they’re not present.
  function buildNextUrl({ nextUrl, token, apiBase, newIds }) {
    const ts = Date.now();
    const newParam = (Array.isArray(newIds) && newIds.length)
      ? `new=${encodeURIComponent(newIds.join(","))}` : "";

    if (nextUrl) {
      const u = new URL(nextUrl, location.href);
      // ensure ts exists (cache-bust), and preserve new if we discovered any
      if (!u.searchParams.has("ts")) u.searchParams.set("ts", String(ts));
      if (newParam && !u.searchParams.has("new")) {
        u.searchParams.set("new", newIds.join(","));
      }
      return u.toString();
    }

    const base = "https://madv313.github.io/Card-Collection-UI/index.html";
    const qp = new URLSearchParams();
    if (token) qp.set("token", token);
    if (apiBase) qp.set("api", apiBase);
    qp.set("fromPackReveal", "true");
    qp.set("ts", String(ts));
    if (newParam) qp.set("new", newIds.join(","));
    return `${base}?${qp.toString()}`;
  }

  /**
   * Fetch reveal cards for this opening, preferring LIVE API and
   * avoiding stale caches. Order:
   *   1) {api}/packReveal/reveal?token=...      (no-store + cache-buster)
   *   2) {api}/packReveal/reveal?uid=...        (legacy)
   *   3) {api}/public/data/reveal_<token>.json  (static on API host)
   *   4) {api}/data/reveal_<token>.json         (alt static on API host)
   *   5) local data/reveal_<token>.json         (GitHub Pages)
   *   6) local data/reveal_<uid>.json           (legacy)
   *   7) local data/mock_pack_reveal.json       (dev fallback)
   */
  async function fetchCards({ token, uid, apiBase }) {
    const ts = Date.now();
    const tryJson = async (url, label) => {
      const withTs = url + (url.includes("?") ? "&" : "?") + "ts=" + ts;
      const res = await fetch(withTs, { cache: "no-store" });
      if (!res.ok) throw new Error(`[${label}] ${res.status} ${res.statusText}`);
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json.cards || []);
      if (json.title && title) title.textContent = json.title;
      console.log("[packreveal] source:", label, "→", arr.length, "cards");
      return arr;
    };

    try {
      if (USE_MOCK_MODE) throw new Error("mock-mode");

      if (apiBase && token) {
        return await tryJson(`${apiBase}/packReveal/reveal?token=${encodeURIComponent(token)}`, "API:token");
      }
      if (apiBase && uid) {
        return await tryJson(`${apiBase}/packReveal/reveal?uid=${encodeURIComponent(uid)}`, "API:uid");
      }

      // If API route not present, try API-hosted static JSON before local files
      if (apiBase && token) {
        try { return await tryJson(`${apiBase}/public/data/reveal_${encodeURIComponent(token)}.json`, "API static:public"); } catch {}
        try { return await tryJson(`${apiBase}/data/reveal_${encodeURIComponent(token)}.json`,        "API static:data"); } catch {}
      }
      if (apiBase && uid) {
        try { return await tryJson(`${apiBase}/public/data/reveal_${encodeURIComponent(uid)}.json`, "API static(uid):public"); } catch {}
        try { return await tryJson(`${apiBase}/data/reveal_${encodeURIComponent(uid)}.json`,        "API static(uid):data"); } catch {}
      }

      // Local static fallbacks (GitHub Pages)
      if (token) {
        try { return await tryJson(`data/reveal_${encodeURIComponent(token)}.json`, "LOCAL token"); } catch {}
      }
      if (uid) {
        try { return await tryJson(`data/reveal_${encodeURIComponent(uid)}.json`, "LOCAL uid"); } catch {}
      }

      // Final dev fallback
      return await tryJson("data/mock_pack_reveal.json", "LOCAL mock");
    } catch (e) {
      console.warn("[packreveal] primary fetch failed:", e?.message || e);
      // Last-ditch mock
      try {
        return await tryJson("data/mock_pack_reveal.json", "LOCAL mock (last)");
      } catch (e2) {
        console.error("[packreveal] all fetch attempts failed:", e2?.message || e2);
        if (title) title.textContent = "Failed to load card pack.";
        return [];
      }
    }
  }
}

packReveal();
