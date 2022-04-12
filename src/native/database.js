/**
 * TODO LIST
 * 1. Handle Write-to-Database beforeWindow closes
 */
const { default: initSqlJS } = require('../native/sqljs/sql-wasm.js')
const { readFileSync } = require('fs')
const { app, ipcRenderer } = require('electron')

//* DATABASE COMPONENTS
const Shared = require('./db/shared')
const Ingoing = require('./db/ingoing')
const Inventory = require('./db/inventory')
const Outgoing = require('./db/outgoing');
const Categories = require('./db/categories')
const Warehouses = require('./db/warehouses')
const Clients = require('./db/clients');

/**
 * DATABASE INITIALIZATIOn
 */
async function initializeDatabase(path) {
    const buffer = readFileSync(path)
    const instance = await initSqlJS()
    const database = new instance.Database(buffer)

    //Database Controllers
    Shared(database);
    Inventory(database);
    Ingoing(database);
    Outgoing(database);
    Categories(database);
    Warehouses(database);
    Clients(database);

    //TODO handle database writing
    //close database
    ipcRenderer.on('app-is-closing', (ev, data) => {
        database.close();
    })
}

module.exports = initializeDatabase