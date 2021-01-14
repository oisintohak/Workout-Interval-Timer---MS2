// TIMER ELEMENTS
const timerDisplay = document.querySelector('#t-display');
const timerStart = document.querySelector('#t-start');
const timerPause = document.querySelector('#t-pause');
const timerReset = document.querySelector('#t-reset');
const timerProgress = document.querySelector('#t-progress-time');
const timerProgressBar = document.querySelector('#t-progress-bar');
// SETTINGS ELEMENTS
const workTimeInput = document.querySelector('#work-time');
const restTimeInput = document.querySelector('#rest-time');
const roundsInput = document.querySelector('#rounds');
const extBreakCheckbox = document.querySelector('#ext-break-checkbox');
const extBreakRounds = document.querySelector('#ext-break-rounds');
const extBreakTime = document.querySelector('#ext-break-time');
const updateTimer = document.querySelector('#update-timer-button');
const timer = {
  running: false,
  hasStarted: false,
  workTime: 3,
  restTime: 2,
  numRounds: 3,
  extBreakOn: false,
  extBreaklength: 0,
  extBreakAfter: 0,
  timeElapsedOnPause: 0
};
const settings = {};

function createRounds(t) {
  t.rounds = {};
  for (let i = 1; i <= t.numRounds*2; i ++) {
    t.rounds[i] = {};
    if (i % 2 === 0) {
      if (i % t.extBreakAfter == 0) {
        t.rounds[i].rest = t.extBreaklength;
      }
      else {
        t.rounds[i].rest = t.restTime;
      }
      // calculate runtime for round:
      t.rounds[i].roundRuntime = t.rounds[i].rest;
    }
    else {
      t.rounds[i].work = t.workTime;
      // calculate runtime for round:
      t.rounds[i].roundRuntime = t.rounds[i].work;
    }
    // add runtime from any previous rounds:
    if (i > 1) {
      t.rounds[i].roundRuntime += t.rounds[i-1].roundRuntime;
    }
  }
}

function calcRuntime (t) {
  t.runtime = t.rounds[t.numRounds * 2].roundRuntime;
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
  // unrounded value for smooth progress bar:
  timer.timeElapsedMs = (new Date().getTime() - timer.startTime) / 1000;
  timer.timeElapsed = Math.floor(timer.timeElapsedMs);
  // if timer was paused, add previous elapsed time
  timer.timeElapsed += timer.timeElapsedOnPause;
  timer.timeRemaining = timer.runtime - timer.timeElapsed;
  displayTime();
  displayProgress();
  checkRound(timer);
}

function checkRound(t) {
  for (let i = 1; i <= t.numRounds*2; i++) {
    if (t.timeElapsed >= t.rounds[i].roundRuntime) {
      t.currentRound = i + 1;
      if (t.currentRound % 2 === 0) {
        t.roundType = 'rest';
      }
      else {
        t.roundType = 'work';
      }
      //change color scheme
      //audio alert
    }
  }
  if (t.currentRound > (t.numRounds*2)) {
    console.log('finish!');
    pauseTimer();
    resetTimer();
  }
}

function displayTime() {
  timerDisplay.textContent = timer.rounds[timer.currentRound].roundRuntime - timer.timeElapsed;
  timerProgress.textContent = `${secondsToFullTime(timer.timeElapsed)}/${secondsToFullTime(timer.runtime)}`;
};

function secondsToFullTime(seconds) {
  let min = `${Math.floor(seconds / 60)}`;
  let sec = (seconds % 60).toString();
  if (sec.length < 2) {
    sec = `0${sec}`;
  }
  return `${min}:${sec}`;
};

function displayProgress() {
  timerProgressBar.value = (timer.timeElapsedMs / timer.runtime) * 100;
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

function disableExtBreak() {
  if (extBreakCheckbox.checked) {
    extBreakRounds.disabled = false;
    extBreakTime.disabled = false;
  }
  else {
    extBreakTime.disabled = true;
    extBreakRounds.disabled = true;
  }
}

timerStart.addEventListener('click', startTimer);
timerPause.addEventListener('click', pauseTimer);
extBreakCheckbox.addEventListener('change', disableExtBreak);