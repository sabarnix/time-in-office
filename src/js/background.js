import '../img/icon-128.png';
import '../img/icon-34.png';

import TimeManager from './TimeManager';
import drawIcon from './drawIcon';

class TimeInOffice {
  constructor() {
    this.url = 'https://tp.internal.directi.com/attendance/';
    this.initializeValues = this.initializeValues.bind(this);
    this.fetchPageHtml = this.fetchPageHtml.bind(this);
    this.getInTime = this.getInTime.bind(this);
    this.setDates = this.setDates.bind(this);
    this.startAlarms = this.startAlarms.bind(this);
    this.onAlarm = this.onAlarm.bind(this);
  }

  init() {
    drawIcon();
    chrome.storage.sync.remove(['timeManager']);
    this.getConfig()
      .then(this.validate)
      .then(this.initializeValues)
      .catch(this.handleInvalidData)
      .then(this.fetchPageHtml)
      .then(this.parseResponse)
      .then(this.toElement)
      .then(this.validateHtml)
      .then(this.getInTime)
      .then(this.setDates)
      .then(this.startAlarms)
      .then(this.onAlarm)
      .catch(this.handleInvalidData);
  }

  getConfig() {
    return new Promise(resolve => chrome.storage.sync.get(['username', 'min', 'expected'], resolve));
  }

  startAlarms() {
    let nextAlarm = null;
    if (this.tm.isIn() && !this.tm.isOut()) {
      const now = new Date();

      if (now < this.tm.timeToPresent()) {
        nextAlarm = this.tm.timeToPresent();
      } else if (now < this.tm.timeToExpected()) {
        nextAlarm = this.tm.timeToExpected();
      } else if (now < this.tm.timeToExpiry()) {
        nextAlarm = this.tm.timeToExpiry();
      } else {
        nextAlarm = new Date(now.getTime() + (30 * 60 * 1000));
      }
    }

    if (nextAlarm) {
      chrome.alarms.create('tp_alert', {
        when: nextAlarm.getTime(),
      });
    }

    chrome.alarms.onAlarm.addListener(this.onAlarm);
  }

  onAlarm(alarm) {
    if ((alarm && !this.tm.isIn() && !this.tm.isOut())) {
      this.init();
      return;
    }

    if (this.tm.isIn() && alarm && alarm.scheduledTime === this.tm.timeToExpected()) {
      chrome.notifications.create('tp_no_login', {
        type: 'basic',
        title: 'Office hours complete!',
        message: 'You\'ve completed your expected time in office',
        iconUrl: chrome.extension.getURL('icon-128.png'),
      });
    }

    drawIcon(this.tm.getColor());
    this.startAlarms();
  }

  validate({ username = '', min = 3, expected = 9 }) {
    if (username === '' || min > expected) {
      throw (new Error('data invalid'));
    } else {
      return {
        username,
        min,
        expected,
      };
    }
  }

  initializeValues({ username, min, expected }) {
    this.username = username;
    this.min = Number(min);
    this.expected = Number(expected);
  }

  fetchPageHtml() {
    return fetch(this.url + this.username);
  }

  parseResponse(response) {
    if (response.ok) {
      return response.text();
    }
    throw (new Error('Invalid Response'));
  }

  toElement(response) {
    const newEle = document.createElement('html');
    newEle.innerHTML = response;
    return newEle;
  }

  validateHtml(element) {
    if (element.querySelector('.error-table')) {
      throw (new Error('invalid username'));
    }

    return element;
  }

  getInTime(element) {
    const today = this.getToday();
    const todayRow = Array.from(element.querySelectorAll('body > table')[2].querySelectorAll('tbody > tr'))
      .filter(tr => tr.classList.contains('edit_attendance_row'))
      .find(tr => tr.querySelectorAll('td')[1].textContent.trim() === today);
    if (!todayRow) return { startTime: false, endTime: false };
    const tds = todayRow.querySelectorAll('td');
    return { startTime: tds[3].innerHTML.trim().replace('-', ''), endTime: tds[4].innerHTML.trim().replace('-', '') };
  }

  getToday() {
    const d = new Date();
    function getDateSuffix(date) {
      if (date > 10 && date < 20) return 'th';
      switch (date % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    }

    function getDayOfWeek(day) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[day];
    }
    return `${d.getDate() + getDateSuffix(d.getDate())}, ${getDayOfWeek(d.getDay())}`;
  }

  setDates({ startTime, endTime }) {
    if (!startTime) {
      chrome.notifications.create('tp_no_login', {
        type: 'basic',
        title: 'Did you forget to login?',
        message: 'No login record found',
        iconUrl: chrome.extension.getURL('icon-128.png'),
      });
      throw (new Error('No login record found'));
    } else if (startTime) {
      const tm = new TimeManager({
        inTimeString: startTime, endTimeString: endTime, min: this.min, expected: this.expected,
      });
      if (tm.isIn()) {
        chrome.storage.sync.set({ timeManager: tm });
      } else {
        chrome.storage.sync.set({ timeManager: undefined });
      }

      this.tm = tm;
    }
  }

  handleInvalidData(e) {
    console.log(e);
  }
}


chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.tabs.create({ url: chrome.extension.getURL('options.html') });
  }
});


const tio = new TimeInOffice();

tio.init();
