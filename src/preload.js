const { contextBridge, ipcRenderer } = require('electron')
const { randomUUID } = require('crypto')
const { join } = require('path')
//* GLOBAL ENV
const { DATA_PATH, APP_NAME, APP_VERSION } = require('./__globals__')
//* INITIALIZATION COMPONENTS
const Database = require('./native/database');
const { dialogRender } = require('./native/dialogs')
//
Database(join(DATA_PATH, '/inventory.db')); //*initialize database
dialogRender(); //*initialize rendere dialog invokers

/**
 * *TRAFFIC LIGHTS CONTROLLER
 */
contextBridge.exposeInMainWorld('clientWindow', {
    close: () => ipcRenderer.send('close-window'),
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window')
})

/**
 * *UTILITIES
 */
contextBridge.exposeInMainWorld('util', {
    randomUUID: () => {
        return randomUUID();
    }
})

/**
 * * GLOBALS
 */

contextBridge.exposeInMainWorld('GLOBALS', {
    APP_NAME,
    APP_VERSION
})

