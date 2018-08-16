class TimeManager {
  constructor({
    inTimeString, endTimeString, min, expected,
  }) {
    this.inTimeString = inTimeString;
    this.endTimeString = endTimeString;
    this.min = min;
    this.expected = expected;
    if (this.isVaid()) {
      this.parseDates();
    } else {
      this.inTime = null;
    }
  }

  isVaid(timeString = this.inTimeString) {
    return timeString && timeString.includes(':');
  }

  parseDates() {
    this.inTime = this.parseTPDate(this.inTimeString);
    this.endTime = this.parseTPDate(this.endTimeString);
  }

  parseTPDate(dateStr) {
    if (this.isVaid(dateStr)) {
      const d = new Date();
      const [hours, minutes] = dateStr.split(':');
      d.setHours(hours);
      d.setMinutes(minutes);
      return d;
    }
    return null;
  }

  isIn() {
    return Boolean(this.inTime);
  }

  isOut() {
    return Boolean(this.endTime);
  }

  getInTime() {
    return this.inTime;
  }

  getElapsedTimeInMinutes() {
    const now = this.endTime || new Date();
    return this.isIn() && (now.getTime() - this.inTime.getTime()) / (60 * 1000);
  }

  getColor() {
    if (!this.isIn()) return '#9e9e9e';

    const timeElapsed = this.getElapsedTimeInMinutes() / 60;

    if (timeElapsed < this.min) {
      return '#b71c1c';
    } if (timeElapsed <= this.expected) {
      return '#ff6f00';
    }
    return '#1b5e20';
  }

  getFormatedTime() {
    if (!this.isIn()) return '';
    const timeElapsed = this.getElapsedTimeInMinutes();
    const hour = `0${Math.floor(timeElapsed / 60)}`.slice(-2);
    const minutes = `0${Math.round(timeElapsed % 60)}`.slice(-2);
    return `${hour}:${minutes}`;
  }

  timeToPresent() {
    if (!this.isIn()) return null;
    return new Date(this.inTime.getTime() + (Number(this.min) * 60 * 60 * 1000));
  }

  timeToExpected() {
    if (!this.isIn()) return null;
    return new Date(this.inTime.getTime() + (Number(this.expected) * 60 * 60 * 1000));
  }

  timeToExpiry() {
    if (!this.isIn()) return null;
    return new Date(this.inTime.getTime() + (16 * 60 * 60 * 1000));
  }
}

export default TimeManager;
