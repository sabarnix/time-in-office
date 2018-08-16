import '../css/popup.css';
import TimeManager from './TimeManager';

function updateDom(tm) {
  document.querySelector('.time-elapsed').textContent = tm.getFormatedTime();
  document.querySelector('.time-elapsed').style.color = tm.getColor();
}


document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['timeManager'], ({ timeManager }) => {
    if (!timeManager) {
      window.close();
      return;
    }
    const tm = new TimeManager(timeManager);
    updateDom(tm);
    setInterval(() => updateDom(tm), 2000);
  });
});
