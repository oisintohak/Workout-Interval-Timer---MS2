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
  t.rounds = [];
  for (let i = 1; i <= t.numRounds; i ++) {
    t.rounds.push(t.workTime);
    if (i % t.extBreakAfter == 0) {
      t.rounds.push(t.extBreaklength);
    }
    else {
      t.rounds.push(t.restTime);
    }
  }
}

function calcRuntime (t) {
  t.runtime = 0;
  for (let item of t.rounds) {
    t.runtime += item;
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
  checkRound();
  displayTime(timer.timeRemaining);
}

function displayTime(time) {
  timerDisplay.textContent = time;
};

function checkRound() {
  let i = 0;
  for (let item of timer.rounds) {
    i += item;
    if (timer.timeElapsed / 1000 >= item) {
      
    }
  }
}

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