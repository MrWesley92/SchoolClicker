// Core state
let gp = 0, bp = 0;
let gpsBase = 0, bpsBase = 0;      // base per-second from buyables
let gpsMultiplier = 1, bpsMultiplier = 1; // temp/permanent multipliers
let goodClickBonus = 0;           // permanent click upgrades from merit
let merit = 0, detention = 0;

// DOM refs
const gpEl = document.getElementById('gp');
const bpEl = document.getElementById('bp');
const gpsEl = document.getElementById('gps');
const bpsEl = document.getElementById('bps');
const meritEl = document.getElementById('merit');
const detentionEl = document.getElementById('detention');
const eventCountdownEl = document.getElementById('event-countdown');
const logContainer = document.getElementById('console');

const goodShopEl = document.getElementById('good-shop');
const badShopEl = document.getElementById('bad-shop');

const goodBtn = document.getElementById('goodBtn');
const badBtn = document.getElementById('badBtn');

// Helper logging
function log(msg) {
  const d = document.createElement('div');
  const ts = new Date().toLocaleTimeString();
  d.textContent = `${ts} • ${msg}`;
  logContainer.prepend(d);
}

// Buyables configuration (repeatable stackable buys)
const buyables = [
  // Good buyables
  { id: 'homework', name: 'Homework Machine', currency: 'GP', cost: 15, scaling: 1.15, count: 0, effect: () => { gpsBase += 1; } },
  { id: 'study',    name: 'Study Group',     currency: 'GP', cost: 75, scaling: 1.15, count: 0, effect: () => { gpsBase += 5; } },
  { id: 'star',     name: 'Star Pupil',      currency: 'GP', cost: 200, scaling: 1.20, count: 0, effect: () => { /* click handled by count */ } },
  { id: 'prefect',  name: 'Head Prefect',    currency: 'GP', cost: 500, scaling: 1.25, count: 0, effect: () => { gpsMultiplier *= 2; } },

  // Bad buyables
  { id: 'cheat',    name: 'Cheat Sheet',     currency: 'BP', cost: 5, scaling: 1.20, count: 0, effect: () => { bpsBase += 2; } },
  { id: 'phone',    name: 'Phone Under Desk',currency: 'BP', cost: 40, scaling: 1.20, count: 0, effect: () => { bpsBase += 10; /* adds detention/sec in loop */ } },
  { id: 'clown',    name: 'Class Clown Club',currency: 'BP', cost: 120, scaling: 1.25, count: 0, effect: () => { /* click handled by count */ } },
  { id: 'rebel',    name: 'Rebel Leader',    currency: 'BP', cost: 300, scaling: 1.30, count: 0, effect: () => { bpsMultiplier *= 2; detention = Math.min(100, detention + 50); } },
  { id: 'chaos',    name: 'Chaos Master',    currency: 'BP', cost: 1000, scaling: 1.35, count: 0, effect: () => { bpsMultiplier *= 3; } },
];

// Render shop into DOM
function renderBuyables() {
  goodShopEl.innerHTML = '';
  badShopEl.innerHTML = '';

  buyables.forEach(b => {
    const btn = document.createElement('button');
    btn.id = 'btn-' + b.id;
    btn.onclick = () => buy(b.id);
    btn.textContent = `${b.name} — Cost: ${Math.floor(b.cost)} ${b.currency}  [Owned: ${b.count}]`;
    if (b.currency === 'GP') goodShopEl.appendChild(btn);
    else badShopEl.appendChild(btn);
  });

  updateUI(); // ensure initial enabled/disabled state
}

// Find buyable by id
function findBuyable(id) {
  return buyables.find(x => x.id === id);
}

// Purchasing logic
function buy(id) {
  const b = findBuyable(id);
  if (!b) return;

  if (b.currency === 'GP') {
    if (gp < b.cost) { log(`Not enough GP for ${b.name}`); return; }
    gp -= Math.floor(b.cost);
  } else {
    if (bp < b.cost) { log(`Not enough BP for ${b.name}`); return; }
    bp -= Math.floor(b.cost);
  }

  b.count += 1;
  b.effect();
  // scale cost up and round
  b.cost = Math.ceil(b.cost * b.scaling);

  log(`Bought ${b.name} (Owned: ${b.count})`);
  updateUI();
}

// Click actions: take into account buyable click bonuses
function doGoodWork() {
  const star = findBuyable('star');
  const starBonus = star ? star.count * 2 : 0;      // +2 GP per Star Pupil
  const clickValue = 1 + goodClickBonus + starBonus;
  gp += clickValue;
  merit = Math.min(100, merit + 2);
  detention = Math.max(0, detention - 2);
  log(`Did Good Work +${clickValue} GP`);
  checkBars();
  updateUI();
}

function doBadWork() {
  const clown = findBuyable('clown');
  const clownBonus = clown ? clown.count * 3 : 0;  // +3 BP per Clown
  const clickValue = 1 + clownBonus;
  bp += clickValue;
  detention = Math.min(100, detention + 2);
  log(`Mess About +${clickValue} BP`);
  checkBars();
  updateUI();
}

// Temporary multipliers helper
function applyTemporaryMultiplier(stat, multiplier, durationMs, label) {
  if (stat === 'gps') {
    gpsMultiplier *= multiplier;
    log(`${label} applied to GP/s ×${multiplier}`);
    setTimeout(() => {
      gpsMultiplier /= multiplier;
      log(`${label} ended for GP/s`);
      updateUI();
    }, durationMs);
  } else if (stat === 'bps') {
    bpsMultiplier *= multiplier;
    log(`${label} applied to BP/s ×${multiplier}`);
    setTimeout(() => {
      bpsMultiplier /= multiplier;
      log(`${label} ended for BP/s`);
      updateUI();
    }, durationMs);
  }
}

// Bars check (merit/detention)
function checkBars() {
  if (merit >= 100) {
    merit = 0;
    goodClickBonus += 2;
    log('🎉 Merit full — +2 GP per click permanently!');
  }
  if (detention >= 100) {
    detention = 0;
    applyTemporaryMultiplier('bps', 0.5, 30000, 'Detention penalty (30s)'); // BP/s halved for 30s
    log('😬 Detention triggered — BP/s halved for 30s');
  }
}

// Passive income loop (1s)
setInterval(() => {
  const gps = Math.floor(gpsBase * gpsMultiplier);
  const bps = Math.floor(bpsBase * bpsMultiplier);

  gp += gps;
  bp += bps;

  // Phone Under Desk adds detention per second
  const phone = findBuyable('phone');
  if (phone && phone.count > 0) {
    detention = Math.min(100, detention + phone.count);
  }

  checkBars();
  updateUI();
}, 1000);

// Event system (random event from pool, countdown and display)
const events = [
  { name: 'Surprise Test', effect: () => {
      if (gp > bp) { gp += 50; log('📚 Surprise Test: You pass! +50 GP'); }
      else { detention = Math.min(100, detention + 20); log('📚 Surprise Test: You fail — Detention +20%'); }
    }
  },
  { name: 'Assembly', effect: () => {
      if (merit > detention) { applyTemporaryMultiplier('gps', 2, 30000, 'Assembly bonus'); }
      else { applyTemporaryMultiplier('gps', 0.5, 30000, 'Assembly penalty'); }
    }
  },
  { name: 'Lunchtime Bonus', effect: () => {
      applyTemporaryMultiplier('gps', 2, 15000, 'Lunchtime'); applyTemporaryMultiplier('bps', 2, 15000, 'Lunchtime');
    }
  },
  { name: 'Group Project', effect: () => {
      gp += 25; bp += 25; log('📝 Group Project: +25 GP & +25 BP');
    }
  },
  { name: 'Cover Teacher', effect: () => {
      if (bp > gp) { bp += 50; log('🧢 Cover Teacher: Chaos! +50 BP'); }
      else { gp = Math.max(0, gp - 20); log('🧢 Cover Teacher: Nothing interesting — -20 GP'); }
    }
  },
  { name: 'Fire Alarm Prank', effect: () => {
      if (detention < 50) { bp += 100; log('🔥 Fire Alarm Prank: Nailed it! +100 BP'); }
      else { detention = 100; log('🔥 Fire Alarm Prank: You got caught! Detention maxed'); }
    }
  },
  { name: 'Playground Rumble', effect: () => {
      if (bp > gp) { applyTemporaryMultiplier('bps', 2, 20000, 'Playground Rumble'); }
      else { detention = Math.min(100, detention + 30); log('😬 Playground Rumble: Teachers saw you — Detention +30%'); }
    }
  },
  { name: 'Viral Meme', effect: () => {
      const phone = findBuyable('phone');
      if (phone && phone.count > 0) { bp += 200; log('📱 Viral Meme: +200 BP (you had a phone)'); }
      else { gp += 10; log('📱 Viral Meme: You laughed — +10 GP'); }
    }
  },
  { name: 'Pop Quiz', effect: () => {
      if (Math.random() < 0.5) { gp += 50; log('❓ Pop Quiz: You smashed it! +50 GP'); }
      else { bp += 50; log('❓ Pop Quiz: You doodled instead! +50 BP'); }
    }
  },
  { name: 'Lost Homework', effect: () => {
      const hw = findBuyable('homework');
      if (hw && hw.count > 0) { log('📂 Lost Homework: You are protected by Homework Machine!'); }
      else { gp = Math.max(0, gp - 20); log('📂 Lost Homework: -20 GP'); }
    }
  },
];

let eventInterval = 60; // seconds
let timer = eventInterval;
let nextEvent = events[Math.floor(Math.random() * events.length)];

setInterval(() => {
  timer--;
  eventCountdownEl.textContent = `⏳ Next Event: ${nextEvent.name} (${timer}s)`;

  if (timer <= 0) {
    log(`--- EVENT: ${nextEvent.name} ---`);
    nextEvent.effect();
    checkBars();
    updateUI();

    nextEvent = events[Math.floor(Math.random() * events.length)];
    timer = eventInterval;
  }
}, 1000);

// Update UI (scores, rates, buyable buttons)
function updateUI() {
  gpEl.textContent = Math.floor(gp);
  bpEl.textContent = Math.floor(bp);

  const gpsDisplay = Math.floor(gpsBase * gpsMultiplier);
  const bpsDisplay = Math.floor(bpsBase * bpsMultiplier);

  gpsEl.textContent = gpsDisplay;
  bpsEl.textContent = bpsDisplay;
  meritEl.textContent = `${Math.floor(merit)}%`;
  detentionEl.textContent = `${Math.floor(detention)}%`;

  // update buyable buttons (text and disable if unaffordable)
  buyables.forEach(b => {
    const btn = document.getElementById('btn-' + b.id);
    if (!btn) return;
    btn.textContent = `${b.name} — Cost: ${Math.floor(b.cost)} ${b.currency}  [Owned: ${b.count}]`;
    if (b.currency === 'GP') btn.disabled = (gp < Math.floor(b.cost));
    else btn.disabled = (bp < Math.floor(b.cost));
  });
}

// Wire click buttons
goodBtn.addEventListener('click', doGoodWork);
badBtn.addEventListener('click', doBadWork);

// Init
renderBuyables();
updateUI();
log('Game loaded. Good luck!');
