const timerDisplay = document.querySelector('#t-display');
const timerStart = document.querySelector('#t-start');
const timerPause = document.querySelector('#t-pause');
const timerReset = document.querySelector('#t-reset');
const timer = {
  running: false,
  hasStarted: false,
  workTime: 30,
  restTime: 15,
  numRounds: 9,
  extBreakOn: true,
  extBreaklength: 30,
  extBreakAfter: 3
};
const settings = {};

function createRounds(t) {
  t.rounds = [];
  for (let i = 1; i <= t.numRounds; i ++) {
    let round = [t.workTime];
    if (i % t.extBreakAfter == 0) {
      round.push(t.extBreaklength);
    }
    else {
      round.push(t.restTime);
    }
    t.rounds.push(round);
  }
}

function startTimer () {
  if (timer.running === true) {
    return;
  }
  if (timer.hasStarted === false) {
    timer.hasStarted = true;
    createRounds(timer);
  }
  timer.startTime = new Date().getTime();
  timer.running = true;
  timer.intervalID = setInterval(countdown, 100);
  
};

function pauseTimer() {
  if (timer.running === true) {
    clearInterval(timer.intervalID);
    timer.running = false;
  }
  else {
    return;
  }
}

function countdown() {
  timer.timeElapsed = new Date().getTime() - timer.startTime;
  if (!timer.timeRemaining) {
    timer.timeRemaining = timer.workTime;
  }
  timer.timeRemaining = timer.workTime - Math.floor((timer.timeElapsed / 1000));
  displayTime(timer.timeRemaining);
}

function displayTime(time) {
  timerDisplay.textContent = time;
};

timerStart.addEventListener('click', startTimer);
timerPause.addEventListener('click', pauseTimer);