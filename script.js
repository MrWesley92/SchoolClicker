let gp = 0, bp = 0;
let gps = 0, bps = 0;
let merit = 0, detention = 0;

const logBox = document.getElementById("log");
const gpEl = document.getElementById("gp");
const bpEl = document.getElementById("bp");
const gpsEl = document.getElementById("gps");
const bpsEl = document.getElementById("bps");
const meritEl = document.getElementById("merit");
const detentionEl = document.getElementById("detention");
const eventTimerEl = document.getElementById("event-timer");

function updateUI() {
  gpEl.textContent = gp;
  bpEl.textContent = bp;
  gpsEl.textContent = gps;
  bpsEl.textContent = bps;
  meritEl.textContent = `${merit}%`;
  detentionEl.textContent = `${detention}%`;

  // Update buyable costs & counts
  buyables.forEach(b => {
    const btn = document.getElementById(b.id);
    if (btn) {
      btn.textContent = `${b.name} (Cost: ${Math.floor(b.cost)} ${b.currency}) [Owned: ${b.count}]`;
    }
  });
}

function log(msg) {
  const entry = document.createElement("div");
  entry.textContent = msg;
  logBox.prepend(entry);
}

function doGoodWork() {
  gp += 1;
  merit = Math.min(100, merit + 2);
  detention = Math.max(0, detention - 2);
  updateUI();
}

function doBadWork() {
  bp += 1;
  detention = Math.min(100, detention + 2);
  updateUI();
}

// === Buyables ===
const buyables = [
  { id: "homework", name: "Homework Machine", currency: "GP", cost: 15, scaling: 1.15, count: 0, effect: () => { gps += 1; }},
  { id: "study", name: "Study Group", currency: "GP", cost: 75, scaling: 1.15, count: 0, effect: () => { gps += 5; }},
  { id: "star", name: "Star Pupil", currency: "GP", cost: 200, scaling: 1.20, count: 0, effect: () => { /* handled later per click */ }},
  { id: "prefect", name: "Head Prefect", currency: "GP", cost: 500, scaling: 1.25, count: 0, effect: () => { gps *= 2; }},

  { id: "cheat", name: "Cheat Sheet", currency: "BP", cost: 5, scaling: 1.20, count: 0, effect: () => { bps += 2; }},
  { id: "phone", name: "Phone Under Desk", currency: "BP", cost: 40, scaling: 1.20, count: 0, effect: () => { bps += 10; /* detention/sec handled separately */ }},
  { id: "clown", name: "Class Clown Club", currency: "BP", cost: 120, scaling: 1.25, count: 0, effect: () => { /* handled later per click */ }},
  { id: "rebel", name: "Rebel Leader", currency: "BP", cost: 300, scaling: 1.30, count: 0, effect: () => { bps *= 2; detention = Math.min(100, detention + 50); }},
  { id: "chaos", name: "Chaos Master", currency: "BP", cost: 1000, scaling: 1.35, count: 0, effect: () => { bps *= 3; }},
];

function renderBuyables() {
  const goodDiv = document.getElementById("good-buyables");
  const badDiv = document.getElementById("bad-buyables");

  goodDiv.innerHTML = "";
  badDiv.innerHTML = "";

  buyables.forEach(b => {
    const btn = document.createElement("button");
    btn.id = b.id;
    btn.classList.add("buyable");
    btn.onclick = () => buy(b);
    btn.textContent = `${b.name} (Cost: ${b.cost} ${b.currency}) [Owned: ${b.count}]`;

    if (b.currency === "GP") {
      goodDiv.appendChild(btn);
    } else {
      badDiv.appendChild(btn);
    }
  });
}

function buy(b) {
  if (b.currency === "GP" && gp >= b.cost) {
    gp -= b.cost;
  } else if (b.currency === "BP" && bp >= b.cost) {
    bp -= b.cost;
  } else {
    log(`Not enough ${b.currency} for ${b.name}`);
    return;
  }

  b.count++;
  b.effect();
  log(`Bought ${b.name} (Owned: ${b.count})`);
  b.cost = Math.floor(b.cost * b.scaling);

  updateUI();
}

// === Passive income loop ===
setInterval(() => {
  gp += gps;
  bp += bps;

  // Star Pupil adds GP per click → handled in doGoodWork
  // Class Clown Club adds BP per click → handled in doBadWork

  // Phone adds detention/sec
  const phone = buyables.find(b => b.id === "phone");
  if (phone.count > 0) {
    detention = Math.min(100, detention + phone.count);
  }

  updateUI();
}, 1000);

// === Event System ===
const events = [
  {name: "Surprise Test", effect: () => {
    if (gp > bp) { gp += 50; log("📚 Surprise Test: You pass! +50 GP"); }
    else { detention = Math.min(100, detention + 20); log("📚 Surprise Test: You fail! Detention +20%"); }
  }},
  {name: "Assembly", effect: () => {
    if (merit > detention) { gps *= 2; log("🎭 Assembly: Teachers impressed! GP/s doubled"); }
    else { gps = Math.floor(gps / 2); log("🎭 Assembly: You’re in trouble. GP/s halved"); }
  }},
  {name: "Lunchtime Bonus", effect: () => {
    gps *= 2; bps *= 2; log("🍔 Lunchtime Bonus! GP & BP doubled"); 
  }},
  {name: "Group Project", effect: () => {
    gp += 25; bp += 25; log("📝 Group Project: +25 GP & +25 BP");
  }},
  {name: "Cover Teacher", effect: () => {
    if (bp > gp) { bp += 50; log("🧢 Cover Teacher: Chaos! +50 BP"); }
    else { gp = Math.max(0, gp - 20); log("🧢 Cover Teacher: Boring lesson… -20 GP"); }
  }},
  {name: "Fire Alarm Prank", effect: () => {
    if (detention < 50) { bp += 100; log("🔥 Fire Alarm Prank: Nailed it! +100 BP"); }
    else { detention = 100; log("🔥 Fire Alarm Prank: You got caught! Detention maxed"); }
  }},
  {name: "Playground Rumble", effect: () => {
    if (bp > gp) { bps *= 2; log("😈 Playground Rumble: BP/s doubled"); }
    else { detention = Math.min(100, detention + 30); log("😈 Playground Rumble: Teachers saw you! Detention +30%"); }
  }},
  {name: "Viral Meme", effect: () => {
    bp += 200; log("📱 Viral Meme: +200 BP");
  }},
  {name: "Pop Quiz", effect: () => {
    if (Math.random() < 0.5) { gp += 50; log("❓ Pop Quiz: You smashed it! +50 GP"); }
    else { bp += 50; log("❓ Pop Quiz: You doodled instead! +50 BP"); }
  }},
  {name: "Lost Homework", effect: () => {
    gp = Math.max(0, gp - 20); log("📂 Lost Homework: -20 GP");
  }}
];

let eventInterval = 60;
let timer = eventInterval;
let nextEvent = events[Math.floor(Math.random() * events.length)];

setInterval(() => {
  timer--;
  eventTimerEl.textContent = `⏳ Next Event: ${nextEvent.name} (${timer}s)`;

  if (timer <= 0) {
    nextEvent.effect();
    updateUI();
    nextEvent = events[Math.floor(Math.random() * events.length)];
    timer = eventInterval;
  }
}, 1000);

renderBuyables();
updateUI();
