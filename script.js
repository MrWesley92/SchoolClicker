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

  document.getElementById("goodRateDisplay").textContent = goodPassive;
  document.getElementById("badRateDisplay").textContent = badPassive;

  // Update bars
  document.getElementById("meritBar").style.width = meritProgress + "%";
  document.getElementById("detentionBar").style.width = detentionProgress + "%";
}

function doGoodWork() {
  goodPoints += goodRate;
  meritProgress = Math.min(progressMax, meritProgress + 2);
  checkProgress();
  updateDisplay();
}

function doBadWork() {
  badPoints += badRate;
  detentionProgress = Math.min(progressMax, detentionProgress + 2);
  checkProgress();
  updateDisplay();
}

function logMessage(msg) {
  const consoleBox = document.getElementById("consoleBox");
  consoleBox.innerHTML += "> " + msg + "<br>";
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

function buyUpgrade(type) {
  switch(type) {
    // Good upgrades
    case "good1":
      if (goodPoints >= 10) {
        goodPoints -= 10;
        goodPassive += 1;
        logMessage("Bought Homework Machine! (+1 GP/s)");
      }
      break;
    case "good2":
      if (goodPoints >= 50) {
        goodPoints -= 50;
        goodPassive += 5;
        logMessage("Bought Study Group! (+5 GP/s)");
      }
      break;
    case "good3":
      if (goodPoints >= 200) {
        goodPoints -= 200;
        goodRate += 5;
        logMessage("Became a Star Pupil! (+5 GP per click)");
      }
      break;

    // Bad upgrades
    case "bad1":
      if (badPoints >= 10) {
        badPoints -= 10;
        badPassive += 1;
        logMessage("Bought Cheat Sheet! (+1 BP/s)");
      }
      break;
    case "bad2":
      if (badPoints >= 50) {
        badPoints -= 50;
        badPassive += 5;
        logMessage("Bought Phone Under Desk! (+5 BP/s)");
      }
      break;
    case "bad3":
      if (badPoints >= 200) {
        badPoints -= 200;
        badRate += 5;
        logMessage("Started Class Clown Club! (+5 BP per click)");
      }
      break;
  }
  updateDisplay();
}

// Check if bars are full
function checkProgress() {
  if (meritProgress >= progressMax) {
    logMessage("🎉 Teachers praise you! Bonus +2 GP per click.");
    goodRate += 2;
    meritProgress = 0;
  }
  if (detentionProgress >= progressMax) {
    logMessage("😈 You got detention! Lost half your BP.");
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
