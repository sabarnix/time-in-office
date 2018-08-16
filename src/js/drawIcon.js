import roundedRect from './roundedRect';

export default function drawIcon(bg = '#c3c3c3') {
  const canvas = document.getElementById('canvas');
  // draw rectangle
  let context = canvas.getContext('2d');
  context.strokeStyle = 'transparent';
  roundedRect(context, 0, 0, 19, 19, 3);
  context.fillStyle = bg;
  context.fill();

  // write text
  context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.font = 'normal 9px Arial';
  context.fillText('TP', 4, 14);

  chrome.browserAction.setIcon({ imageData: context.getImageData(0, 0, 19, 19) });
}
