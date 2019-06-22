const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const DataStore = require('./renderer/MusicDataStore');

const myStore = new DataStore({name: 'Music Data'});

class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    };
    const finalConfig = {...basicConfig, ...config};
    super(finalConfig);
    this.loadFile(fileLocation);
    this.once('ready-to-show', () => {
      this.show();
    });
  }
}

app.on('ready', () => {
  const mainWindow = new AppWindow({}, './renderer/index.html');
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.send('getTracks', myStore.getTracks());
  });

  ipcMain.on('add-music-window', () => {
    const addWindow = new AppWindow({
      width: 500,
      height: 400,
      parent: mainWindow,
    }, './renderer/add.html');
    // addWindow.webContents.openDevTools();
  });

  ipcMain.on('open-music-file', (event) => {
    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{name: 'Music', extensions: ['mp3']}],
    }, (files) => {
      console.log(files);
      if (files) {
        event.sender.send('selected-file', files);
      }
    });
  });

  ipcMain.on('add-tracks', (event, tracks) => {
    const updateTracks = myStore.addTracks(tracks).getTracks();
    mainWindow.send('getTracks', updateTracks);
    dialog.showMessageBox({
      type: 'info',
      title: '提示',
      message: '导入成功',
    });
  });

  ipcMain.on('delete-track', (event, id) => {
    const updateTracks = myStore.deleteTrack(id).getTracks();
    mainWindow.send('getTracks', updateTracks);
  });
});
