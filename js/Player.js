export class Player {
  playerTimer = null;
  playerState = false;
  playerTime = 0;
  playerMinTime = 0;
  playerMaxTime = 10000;
  playerStepTime = 100;

  constructor({ min = 0, max = 10000, step = 100 } = {}) {
    this.playerMinTime = min;
    this.playerMaxTime = max;
    this.playerStepTime = step;
  }

  get time() {
    return this.playerTime;
  }

  loging() {
    console.log("Player: loging", this);
  }

  start() {
    this.loging();
    this.playerTimer = setInterval(() => {
      this.playerTime += this.playerStepTime;
      if (this.playerTime >= this.playerMaxTime) {
        this.stop();
      }
    }, this.playerStepTime);
  }

  stop() {
    this.loging();
    this.playerTimer && clearInterval(this.playerTimer);
    this.playerTimer = null;
  }

  pause() {
    this.loging();
    this.stop();
  }
}
