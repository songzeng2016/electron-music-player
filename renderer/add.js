const {ipcRenderer} = require('electron');
const path = require('path');
const {$} = require('./helper');

const renderListHTML = (paths) => {
  const musicList = $('musicList');
  const musicItemsHTML = paths.reduce((html, music) => {
    html += `<li class="list-group-item">${path.basename(music)}</li>`;
    return html;
  }, '');
  musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`;
};

$('select-music').addEventListener('click', () => {
  ipcRenderer.send('open-music-file');
});

ipcRenderer.on('selected-file', (event, path) => {
  if (Array.isArray(path)) {
    console.log(path);
    renderListHTML(path);
  }
});
