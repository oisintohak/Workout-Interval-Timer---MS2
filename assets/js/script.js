// SETTINGS ELEMENTS
const workTimeInput = document.querySelector('#work-time');
const restTimeInput = document.querySelector('#rest-time');
const roundsInput = document.querySelector('#rounds');
const extBreakCheckbox = document.querySelector('#ext-break-checkbox');
const extBreakRounds = document.querySelector('#ext-break-rounds');
const extBreakTime = document.querySelector('#ext-break-time');
const countdownCheckbox = document.querySelector('#countdown-checkbox');
const countdownTime = document.querySelector('#countdown-time');
const modalForm = document.querySelector('#modal-form');
// TIMER ELEMENTS
const timerDisplay = document.querySelector('#t-display');
const timerMessage = document.querySelector('#t-message');
const timerStart = document.querySelector('#t-start');
const timerPause = document.querySelector('#t-pause');
const timerReset = document.querySelector('#t-reset');
const timerProgressSegments = document.querySelector('#t-progress-segments');
const timerProgressOverlay = document.querySelector('#t-progress-overlay');
const timerProgress = document.querySelector('#t-progress-time');

const timer = {
  running: false,
  hasStarted: false,
  workTime: 30,
  restTime: 10,
  numRounds: 9,
  countdown: true,
  countdownTime: 5,
  countdownComplete: false,
  extBreak: true,
  extBreakLength: 30,
  extBreakAfter: 3,
  timeElapsedOnPause: 0
};

function createRounds() {
  timer.rounds = {};
  for (let i = 1; i <= timer.numRounds*2; i ++) {
    timer.rounds[i] = {};
    if (i % 2 === 0) {
      if (timer.extBreak === true && i % timer.extBreakAfter == 0) {
        timer.rounds[i].rest = timer.extBreakLength;
      }
      else {
        timer.rounds[i].rest = timer.restTime;
      }
      // calculate runtime for round:
      timer.rounds[i].roundRuntime = timer.rounds[i].rest;
    }
    else {
      timer.rounds[i].work = timer.workTime;
      // calculate runtime for round:
      timer.rounds[i].roundRuntime = timer.rounds[i].work;
    }
    // add runtime from any previous rounds:
    if (i > 1) {
      timer.rounds[i].roundRuntime += timer.rounds[i-1].roundRuntime;
    }
  }
};

function calcRuntime () {
  timer.runtime = timer.rounds[timer.numRounds * 2].roundRuntime;
};

function createSegments() {
  timerProgressSegments.innerHTML = '';
  for (let i = 1; i <= timer.numRounds * 2; i ++) {
    // calculate percentage of total runtime:
    let span = document.createElement('span');
    let p;
    if (i % 2 !== 0) {
      p = `${((timer.workTime / timer.runtime) * 100).toFixed(2)}%`;
      span.textContent = 'W';
      span.style.backgroundColor = '#59dd5e';
    } 
    else {
      p = `${((timer.rounds[i].rest / timer.runtime) * 100).toFixed(2)}%`;
      span.textContent = 'R';
      span.style.backgroundColor = '#ff6347';
    }
    span.style.width = p;

    timerProgressSegments.appendChild(span);
  }
}

function startTimer () {
  if (timer.countdown === true && timer.countdownComplete === false) {
    timer.countdownStartTime = new Date().getTime();
    timer.countdownID = setInterval(countdown, 100);
    return;
  }
  if (timer.running === true) {
    return;
  }
  if (timer.hasStarted === false) {
    timer.hasStarted = true;
    timer.currentRound = 1;
    createRounds();
    createSegments();
    calcRuntime();
    timer.roundType = 'work';
    timer.timeElapsed = 0;
  }
  timer.startTime = new Date().getTime();
  timer.running = true;
  displayMessage();
  changeColor();
  if ((timer.countdown === true && timer.countdownComplete === true) || timer.countdown === false)
  timer.intervalID = setInterval(runTimer, 100);
};

function countdown () {
  timer.countdownElapsed = Math.floor((new Date().getTime() - timer.countdownStartTime)) / 1000;
  timer.countdownRemaining = timer.countdownTime - timer.countdownElapsed;
  timerDisplay.textContent = Math.floor(timer.countdownRemaining) + 1;
  if (timer.countdownRemaining <= 0) {
    timer.countdownComplete = true;
    clearInterval(timer.countdownID);
    startTimer();
  }
};

function runTimer() {
  timer.timeElapsed = (new Date().getTime() - timer.startTime) / 1000;
  // if timer was paused, add previous elapsed time
  timer.timeElapsed += timer.timeElapsedOnPause;
  displayTime();
  displayProgress();
  checkRound();
};

function checkRound() {
  for (let i = 1; i <= timer.numRounds*2; i++) {
    if (timer.timeElapsed >= timer.rounds[i].roundRuntime) {
      timer.currentRound = i + 1;
      if (timer.currentRound % 2 === 0) {
        timer.roundType = 'rest';
        changeColor('red');
        displayMessage();
      }
      else {
        timer.roundType = 'work';
        changeColor('green'); 
        displayMessage();
      }
    }
  }
  if (timer.currentRound > (timer.numRounds*2)) {
    // when timer completes:
    pauseTimer();
    resetTimer();
    timerMessage.textContent = '-';
    timerDisplay.textContent = 'DONE!';
    changeColor('blue');
    // manual completion of progress bar in case of negative value:
    timerProgressOverlay.style.width = '0%';
  }
};

function displayTime() {
  let time = timer.rounds[timer.currentRound].roundRuntime - Math.floor(timer.timeElapsed);
  // prevent display from briefly flashing to 0 between rounds:
  time == 0 ? timerDisplay.textContent = 1 : timerDisplay.textContent = time;
  timerProgress.textContent = `${secondsToFullTime(Math.floor(timer.timeElapsed))}/${secondsToFullTime(timer.runtime)}`;
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
  timerProgressOverlay.style.width = `${100 - ((timer.timeElapsed / timer.runtime) * 100)}%`;
};

function displayMessage() {
  if (timer.hasStarted === false) {
    timerMessage.textContent = 'Ready';
  }
  if (timer.hasStarted === true && timer.running === false) {
    timerMessage.textContent = 'Paused';
  }
  if (timer.roundType === 'work' && timer.running === true) {
    timerMessage.textContent = 'GO!';
  } 
  if (timer.roundType === 'rest' && timer.running === true) {
    timerMessage.textContent = 'Rest';
  }
};

function changeColor(color) {
  let body = document.querySelector('body');
  if (!color) {
    if (timer.currentRound % 2 === 0) {
      changeColor('red');
    }
    else {
      changeColor('green');
    }
  }
  if (color == 'blue') {
    body.style.backgroundColor = '#00CED1';
  }
  if (color == 'red') {
    body.style.backgroundColor = '#ff6347';
  }
  if (color == 'green') {
    body.style.backgroundColor = '#59dd5e';
  }
  if (color == 'orange') {
    body.style.backgroundColor = '#ffc352';
  }
}

function pauseTimer() {
  if (timer.running === true) {
    clearInterval(timer.intervalID);
    timer.running = false;
    timer.timeElapsedOnPause = timer.timeElapsed;
    timer.countdownComplete = false;
    displayMessage();
    changeColor('orange');
  }
  else {
    return;
  }
};

function resetTimer() {
  pauseTimer();
  timer.currentRound = 1;
  timer.hasStarted = false;
  timer.roundType = 'work';
  timer.timeElapsedOnPause = 0;
  delete timer.startTime;
  delete timer.timeElapsed;
  delete timer.timeElapsedMs;
  delete timer.timeRemaining;
  createRounds();
  calcRuntime();
  timerDisplay.textContent = '00';
  timerProgress.textContent = `00:00/${secondsToFullTime(timer.runtime)}`;
  timerProgressOverlay.style.width = '100%';
  checkRound();
  timerDisplay.textContent = `${timer.workTime}`;
  createSegments();
  displayMessage();
  changeColor('blue');
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
};

function disableCountdown() {
  if (countdownCheckbox.checked) {
    countdownTime.disabled = false;
  }
  else {
    countdownTime.disabled = true;
  }
};

function updateTimer(event) {
  pauseTimer();
  timer.running = false;
  timer.hasStarted = false;
  timer.workTime = parseFloat(workTimeInput.value);
  timer.restTime = parseFloat(restTimeInput.value);
  timer.numRounds = parseFloat(roundsInput.value);
  extBreakCheckbox.checked === true ? timer.extBreak = true : timer.extBreak = false;
  timer.extBreakLength = parseFloat(extBreakTime.value);
  timer.extBreakAfter = parseFloat(extBreakRounds.value);
  timer.timeElapsedOnPause = 0;
  countdownCheckbox.checked === true ? timer.countdown = true : timer.countdown = false;
  timer.countdownTime = parseFloat(countdownTime.value);
  resetTimer();
  event.preventDefault();
  closeModal();
};

function closeModal() {
  let modalElement = document.querySelector('#staticBackdrop');
  let modal = bootstrap.Modal.getInstance(modalElement);
  modal.hide();
};

resetTimer();
timerStart.addEventListener('click', startTimer);
timerPause.addEventListener('click', pauseTimer);
timerReset.addEventListener('click', resetTimer);
extBreakCheckbox.addEventListener('change', disableExtBreak);
countdownCheckbox.addEventListener('change', disableCountdown);
modalForm.addEventListener('submit', updateTimer);
