const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// *COMPONENTS
const TrafficLights = require('./native/windowcontroller');
const { dialogMain } = require('./native/dialogs')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}
let mainWindow = null //*main window

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    frame: false,
    minWidth: 400,
    minHeight: 300,
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, '/preload.js'),
      textAreasAreResizable: false,
    }
  });

  //* Window Traffic Lights
  TrafficLights(mainWindow);
  //* Main Renderer Dialog Handlers
  dialogMain(mainWindow)
  // mainWindow.loadFile(path.join(__dirname, 'app/public/index.html'));
  mainWindow.loadURL('http://localhost:5000/');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

//* CREATE WINDOW
app.on('ready', () => {
  createWindow()
});

//TODO Send Signal Before Close to Write Data to (Database)
app.on('before-quit', () => {
  mainWindow.webContents.send('app-is-closing', {});
})


//MACOS Specific
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

