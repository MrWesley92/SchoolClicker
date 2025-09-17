let goodPoints = 0;
let badPoints = 0;
let goodRate = 1;
let badRate = 1;
let goodPassive = 0;
let badPassive = 0;

function updateDisplay() {
  document.getElementById("goodPoints").textContent = goodPoints;
  document.getElementById("badPoints").textContent = badPoints;
}

function doGoodWork() {
  goodPoints += goodRate;
  updateDisplay();
}

function doBadWork() {
  badPoints += badRate;
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

// Passive income every second
setInterval(() => {
  goodPoints += goodPassive;
  badPoints += badPassive;
  updateDisplay();
}, 1000);

updateDisplay();
