// SETTINGS ELEMENTS
const workTimeInput = document.querySelector('#work-time');
const restTimeInput = document.querySelector('#rest-time');
const roundsInput = document.querySelector('#rounds');
const extBreakCheckbox = document.querySelector('#ext-break-checkbox');
const extBreakRounds = document.querySelector('#ext-break-rounds');
const extBreakTime = document.querySelector('#ext-break-time');
const countdownCheckbox = document.querySelector('#countdown-checkbox');
const countdownTime = document.querySelector('#countdown-time');
const cancelModalButton = document.querySelector('#cancel-button');
const modalForm = document.querySelector('#modal-form');
// TIMER ELEMENTS
const timerDisplay = document.querySelector('#t-display');
const timerMessage = document.querySelector('#t-message');
const timerPlayPause = document.querySelector('#t-play-pause');
const timerReset = document.querySelector('#t-reset');
const timerMute = document.querySelector('#t-mute');
const timerProgressSegments = document.querySelector('#t-progress-segments');
const timerProgressOverlay = document.querySelector('#t-progress-overlay');
const timerProgress = document.querySelector('#t-progress-time');
// AUDIO
const shortBeep = new Audio('../audio/short.mp3');
const longBeep = new Audio('../audio/long.mp3');

// object to store default settings and values
const timer = {
  state: 'paused',
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
  timeElapsedOnPause: 0,
  muted: false
};

// create objects nested in an array to store times for each round
// and accumulated time
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

// calculate total runtime
function calcRuntime () {
  timer.runtime = timer.rounds[timer.numRounds * 2].roundRuntime;
};

// create segments for work/rest periods in progress bar
function createSegments() {
  timerProgressSegments.innerHTML = '';
  for (let i = 1; i <= timer.numRounds * 2; i ++) {
    let span = document.createElement('span');
    let p;
    // calculate percentage of total runtime(p):
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

function playPauseTimer () {
  if (timer.state == 'paused') {
    timer.state = 'playing';
    togglePlayPause();
    startTimer();
  }
  else {
    timer.state = 'paused';
    togglePlayPause();
    pauseTimer();
  }
};

function togglePlayPause() {
  if (timer.state == 'playing') {
    let play = `<i class="fas fa-pause-circle"></i>`;
    timerPlayPause.innerHTML = '';
    timerPlayPause.insertAdjacentHTML('afterbegin', play);
  }
  else {
    let pause = `<i class="fas fa-play-circle"></i>`;
    timerPlayPause.innerHTML = '';
    timerPlayPause.insertAdjacentHTML('afterbegin', pause);
  }
};

// run the timer when start button is pressed
function startTimer () {
  if (timer.running) {
    return;
  }
  if (timer.countdown && !timer.countdownComplete) {
    timer.countdownStartTime = new Date().getTime();
    displayMessage('Get Ready...');
    changeColor('blue');
    timer.countdownID = setInterval(countdown, 100);
    return;
  }
  if (!timer.hasStarted) {
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
  displayMessage('GO!');
  changeColor();
  if ((timer.countdown && timer.countdownComplete) || !timer.countdown)
  timer.intervalID = setInterval(runTimer, 100);
};

// run the countdown for the specified time
function countdown () {
  timer.countdownElapsed = Math.floor((new Date().getTime() - timer.countdownStartTime)) / 1000;
  timer.countdownRemaining = timer.countdownTime - timer.countdownElapsed;
  let next = Math.floor(timer.countdownRemaining) + 1;
  beep(timerDisplay.textContent, next);
  timerDisplay.textContent = next;
  if (timer.countdownRemaining <= 0) {
    timer.countdownComplete = true;
    clearInterval(timer.countdownID);
    startTimer();
  }
};

// compare the current time to the start time and calulate remaining time
function runTimer() {
  timer.timeElapsed = (new Date().getTime() - timer.startTime) / 1000;
  // if timer was paused, add previous elapsed time
  timer.timeElapsed += timer.timeElapsedOnPause;
  displayTime();
  displayProgress();
  checkRound();
};

// play audio for last 4 seconds of each round/countdown
function beep (current, next) {
  if (current <= 4 && next < current) {
    if (current == 1) {
      longBeep.play();
    }
    else {
      shortBeep.play();
    }
  }
}

// calculate the current round number
// change the color and message if the round has changed
function checkRound() {
  for (let i = 1; i <= timer.numRounds*2; i++) {
    if (timer.timeElapsed >= timer.rounds[i].roundRuntime) {
      timer.currentRound = i + 1;
      if (timer.currentRound % 2 === 0) {
        timer.roundType = 'rest';
        changeColor('red');
        displayMessage('Rest');
      }
      else {
        timer.roundType = 'work';
        changeColor('green'); 
        displayMessage('GO!');
      }
    }
  }
  // when timer completes:
  if (timer.currentRound > (timer.numRounds*2)) {
    pauseTimer();
    resetTimer();
    timerMessage.textContent = '-';
    timerDisplay.textContent = 'DONE!';
    changeColor('blue');
    // manual completion of progress bar in case of negative value:
    timerProgressOverlay.style.width = '0%';
  }
};

// calculate the remaining time in the current round and display it
function displayTime() {
  let time = timer.rounds[timer.currentRound].roundRuntime - Math.floor(timer.timeElapsed);
  beep(timerDisplay.textContent, time);
  // prevent display from briefly flashing to 0 between rounds:
  time == 0 ? timerDisplay.textContent = 1 : timerDisplay.textContent = time;
  timerProgress.textContent = `${secondsToFullTime(Math.floor(timer.timeElapsed))}/${secondsToFullTime(timer.runtime)}`;
};

// convert milliseconds to time in '00:00' format
function secondsToFullTime(seconds) {
  let min = `${Math.floor(seconds / 60)}`;
  let sec = (seconds % 60).toString();
  if (sec.length < 2) {
    sec = `0${sec}`;
  }
  return `${min}:${sec}`;
};

// calculate the percentage of runtime completed and update progress bar
function displayProgress() {
  timerProgressOverlay.style.width = `${100 - ((timer.timeElapsed / timer.runtime) * 100)}%`;
};

// display the appropriate message according to the round and the state of the timer
function displayMessage(message) {
  timerMessage.textContent = message;
};

// change the background color to reflect the current timer state
function changeColor(color) {
  let body = document.querySelector('body');
  // if function was called without argument, check current round:
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

// cease the recurring function and record the time elapsed
// change the message and color to reflect the timer state
function pauseTimer() {
  if (timer.countdown && !timer.countdownComplete) {
    clearInterval(timer.countdownID);
    displayMessage('Paused');
    changeColor('orange');
  }
  if (timer.running) {
    clearInterval(timer.intervalID);
    timer.running = false;
    timer.timeElapsedOnPause = timer.timeElapsed;
    timer.countdownComplete = false;
    displayMessage('Paused');
    changeColor('orange');
  }
};

// clear any recorded elapsed time and clear the display and progress
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
  displayMessage('Press Start');
  changeColor('blue');
};

function toggleMute () {
  let unmute = `<i class="fas fa-volume-up"></i>`;
  let mute = `<i class="fas fa-volume-mute"></i>`;
  if (timer.muted) {
    timer.muted = false;
    shortBeep.muted = false;
    longBeep.muted = false;
    timerMute.innerHTML = '';
    timerMute.insertAdjacentHTML('afterbegin', unmute);
  }
  else {
    timer.muted = true;
    shortBeep.muted = true;
    longBeep.muted = true;
    timerMute.innerHTML = '';
    timerMute.insertAdjacentHTML('afterbegin', mute);
  }
}

// if checkbox is changed, disable related inputs
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

// if checkbox is changed, disable related inputs
function disableCountdown() {
  if (countdownCheckbox.checked) {
    countdownTime.disabled = false;
  }
  else {
    countdownTime.disabled = true;
  }
};

// update timer settings with values from user input
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

// target and close the settings modal
function closeModal() {
  let modalElement = document.querySelector('#settingsModal');
  let modal = bootstrap.Modal.getInstance(modalElement);
  modal.hide();
};

// close modal and reset inputs to current value
function cancelModal() {
  workTimeInput.value = timer.workTime;
  restTimeInput.value = timer.restTime;
  roundsInput.value = timer.numRounds;
  timer.extBreak ? extBreakCheckbox.checked = true : extBreakCheckbox.checked = false;
  disableExtBreak();
  extBreakTime.value = timer.extBreakLength;
  extBreakRounds.value = timer.extBreakAfter;
  timer.countdown ? countdownCheckbox.checked = true : countdownCheckbox.checked = false;
  disableCountdown();
  countdownTime.value = timer.countdownTime;
  closeModal();
}

// reset the timer when the page loads to display message and change color:
resetTimer();

// EVENT LISTENERS:
timerPlayPause.addEventListener('click', playPauseTimer);
timerReset.addEventListener('click', resetTimer);
timerMute.addEventListener('click', toggleMute);
extBreakCheckbox.addEventListener('change', disableExtBreak);
countdownCheckbox.addEventListener('change', disableCountdown);
cancelModalButton.addEventListener('click', cancelModal);
modalForm.addEventListener('submit', updateTimer);
