const { app, ipcMain } = require('electron')

function main(mainWindow) {
    ipcMain.on('close-window', (event, data) => {
        app.exit(); //close window
    })
    ipcMain.on('minimize-window', (event, data) => {
        mainWindow.minimize(); //minimize window
    })
    ipcMain.on('maximize-window', (event, data) => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
        //maximize|unmaximize window
    })
}

module.exports = main