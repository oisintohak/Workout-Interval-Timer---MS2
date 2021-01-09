const timerDisplay = document.querySelector('#t-display');
const timerPlay = document.querySelector('#t-play');
const timerPause = document.querySelector('#t-pause');
const timerReset = document.querySelector('#t-reset');
const timer = {
  workTime: 30,
  restTime: 15,
  rounds: 9,
  extBreakOn: true,
  extBreaklength: 30,
  extBreakAfter: 3
};
const settings = {};

const startTimer = () => {
  timer.startTime = new Date().getTime();
};

const countdown = () => {
  timer.timeElapsed = new Date().getTime() - timer.startTime;
  timer.timeRemaining = timer.workTime - (timer.timeElapsed / 1000);
};

const displayTime = (time) => {
  timerDisplay.textContent = time;
};