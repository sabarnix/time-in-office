import '../css/options.css';

class Options {
  constructor() {
    this.setValue = this.setValue.bind(this);
    this.onUserNameChange = this.onUserNameChange.bind(this);
    this.onMinimumChange = this.onMinimumChange.bind(this);
    this.onExpectedChange = this.onExpectedChange.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  init() {
    this.initSelectors();
    this.addChangeListeners();
    this.getInitialValue()
      .then(this.setValue);
  }


  initSelectors() {
    this.usernameInput = document.querySelector('#username');
    this.minimumInput = document.querySelector('#minimum');
    this.minimumDisplay = document.querySelector('#min-display');
    this.expectedInput = document.querySelector('#expected');
    this.expectedDisplay = document.querySelector('#expected-display');
    this.submitElement = document.querySelector('#submit');
    this.form = document.querySelector('.form');
  }

  getInitialValue() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['username', 'min', 'expected'], ({ username = '', min = 3, expected = 9 }) => (resolve({
        username,
        min,
        expected,
      })));
    });
  }

  addChangeListeners() {
    this.usernameInput.addEventListener('keyup', this.onUserNameChange);
    this.minimumInput.addEventListener('input', this.onMinimumChange);
    this.expectedInput.addEventListener('input', this.onExpectedChange);
    this.submitElement.addEventListener('click', this.onSave);
  }

  onUserNameChange(e) {
    const input = e.target.closest('input');
    this.usernameInput.classList.remove('is-danger');
    const errorMsg = this.usernameInput.closest('.field').querySelector('.help');
    if (errorMsg) {
      this.usernameInput.closest('.field').querySelector('.help').remove();
    }
    this.username = input.value;
    this.updateValues();
  }

  onMinimumChange(e) {
    const input = e.target.closest('input');
    this.min = input.value;
    this.updateValues();
  }

  onExpectedChange(e) {
    const input = e.target.closest('input');
    this.expected = input.value;
    this.updateValues();
  }

  setInputVal(val, input) {
    this[`${input}Input`].value = val;
  }

  onSave() {
    if (this.username === '') {
      const errorP = document.createElement('p');
      errorP.classList.add('help', 'is-danger');
      errorP.textContent = 'Username is a required field';
      this.usernameInput.closest('.field').appendChild(errorP);
      this.usernameInput.classList.add('is-danger');
    } else {
      this.save().then(() => {
        const msg = document.createElement('div');
        msg.classList.add('notification', 'is-success');
        msg.textContent = 'Options saved successfully';
        this.form.prepend(msg);
        chrome.extension.getBackgroundPage().window.location.reload();
        setTimeout(() => {
          msg.remove();
        }, 3000);
      });
    }
  }

  save() {
    return new Promise((resolve) => {
      chrome.storage.sync.set({
        username: this.username,
        min: this.min,
        expected: this.expected,
      }, () => resolve());
    });
  }

  updateValues() {
    this.setInputVal(this.username, 'username');
    this.setInputVal(this.min, 'minimum');
    this.minimumDisplay.textContent = this.min;
    this.setInputVal(this.expected, 'expected');
    this.expectedDisplay.textContent = this.expected;
  }

  setValue(values) {
    Object.keys(values).forEach((k) => {
      this[k] = values[k];
    });
    this.updateValues();
  }
}

const options = new Options();

window.addEventListener('load', () => {
  options.init();
});
