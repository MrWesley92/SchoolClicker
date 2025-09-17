let goodPoints = 0;
let badPoints = 0;
let goodRate = 1;
let badRate = 1;
let goodPassive = 0;
let badPassive = 0;

// Progress bars
let meritProgress = 0;
let detentionProgress = 0;
const progressMax = 100;

function updateDisplay() {
  document.getElementById("goodPoints").textContent = goodPoints;
  document.getElementById("badPoints").textContent = badPoints;

  // Update bars
  document.getElementById("meritBar").style.width = meritProgress + "%";
  document.getElementById("detentionBar").style.width = detentionProgress + "%";
}

function doGoodWork() {
  goodPoints += goodRate;
  meritProgress = Math.min(progressMax, meritProgress + 2); // +2% per click
  checkProgress();
  updateDisplay();
}

function doBadWork() {
  badPoints += badRate;
  detentionProgress = Math.min(progressMax, detentionProgress + 2); // +2% per click
  checkProgress();
  updateDisplay();
}

function buyUpgrade(type) {
  if (type === "good" && goodPoints >= 10) {
    goodPoints -= 10;
    goodPassive += 1;
    alert("Homework Machine bought! (+1 GP per second)");
  }
  if (type === "bad" && badPoints >= 10) {
    badPoints -= 10;
    badPassive += 1;
    alert("Cheat Sheet bought! (+1 BP per second)");
  }
  updateDisplay();
}

// Check if bars are full
function checkProgress() {
  if (meritProgress >= progressMax) {
    alert("🎉 You’ve earned enough merits! Teachers praise you. Bonus +2 GP/click!");
    goodRate += 2;
    meritProgress = 0;
  }
  if (detentionProgress >= progressMax) {
    alert("😈 You’ve landed in detention! You lose half your BP.");
    badPoints = Math.floor(badPoints / 2);
    detentionProgress = 0;
  }
}

// Passive income every second
setInterval(() => {
  goodPoints += goodPassive;
  badPoints += badPassive;

  if (goodPassive > 0) meritProgress = Math.min(progressMax, meritProgress + goodPassive);
  if (badPassive > 0) detentionProgress = Math.min(progressMax, detentionProgress + badPassive);

  checkProgress();
  updateDisplay();
}, 1000);

updateDisplay();
