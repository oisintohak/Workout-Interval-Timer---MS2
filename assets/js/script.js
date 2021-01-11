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
  extBreakAfter: 3,
  timeElapsedOnPause: 0
};
const settings = {};

function createRounds(t) {
  t.rounds = {};
  for (let i = 1; i <= t.numRounds; i ++) {
    t.rounds[i] = {};
    t.rounds[i].work = t.workTime;
    if (i % t.extBreakAfter == 0) {
      t.rounds[i].rest = t.extBreaklength;
    }
    else {
      t.rounds[i].rest = t.restTime;
    }
  }
}

function calcRuntime (t) {
  t.runtime = 0;
  for (let i = 1;i <= t.numRounds; i++){
    t.runtime += t.rounds[i].work;
    t.runtime += t.rounds[i].rest;
  }
}

function startTimer () {
  if (timer.running === true) {
    return;
  }
  if (timer.hasStarted === false) {
    timer.hasStarted = true;
    createRounds(timer);
    calcRuntime(timer);
    timer.currentRound = 1;
    timer.roundType = 'work';
    timer.timeElapsed = 0;
  }
  timer.startTime = new Date().getTime();
  timer.running = true;
  timer.intervalID = setInterval(countdown, 100);
  
};


function countdown() {
  timer.timeElapsed = new Date().getTime() - timer.startTime;
  // if timer was paused, add previous elapsed time
  timer.timeElapsed += timer.timeElapsedOnPause;
  console.log(timer.timeElapsed);
  timer.timeRemaining = timer.runtime - Math.floor((timer.timeElapsed / 1000));
  displayTime(timer.timeRemaining);
}

function displayTime(time) {
  timerDisplay.textContent = time;
};


function pauseTimer() {
  if (timer.running === true) {
    clearInterval(timer.intervalID);
    timer.running = false;
    timer.timeElapsedOnPause = timer.timeElapsed;
  }
  else {
    return;
  }
};

function resetTimer() {
  pauseTimer();
  timer.hasStarted = false;
  // load default settings
};

timerStart.addEventListener('click', startTimer);
timerPause.addEventListener('click', pauseTimer);