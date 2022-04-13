const { contextBridge } = require('electron')
const { wrapper } = require('./utils')

function shared(database) {
    contextBridge.exposeInMainWorld('shared', {
        //get product list
        productList: () => {
            return wrapper(() => {
                const sql = database.exec('SELECT id, product, description, (max - quantity) as remainder FROM master')
                return {
                    columns: sql[0]?.columns,
                    values: sql[0]?.values
                }
            }, {})
        },
        //category lists
        categoryList: () => {
            return wrapper(() => {
                const sql = database.exec('SELECT * FROM categories;')
                return {
                    columns: sql[0]?.columns,
                    values: sql[0]?.values
                }
            }, {});
        },
        //warehouse list
        warehouseList: () => {
            return wrapper(() => {
                const sql = database.exec('SELECT * FROM warehouses;')
                return {
                    columns: sql[0]?.columns,
                    values: sql[0]?.values
                }
            }, {})
        },
        //supplier list
        supplierList: () => {
            return wrapper(() => {
                const sql = database.exec('SELECT * FROM clients_supplier')
                return {
                    columns: sql[0]?.columns,
                    values: sql[0]?.values
                }
            }, {})
        },
        //customerList
        customerList: () => {
            return wrapper(() => {
                const sql = database.exec('SELECT * FROM clients_customer')
                return {
                    columns: sql[0]?.columns,
                    values: sql[0]?.values
                }
            }, {})
        },
    })
}

module.exports = shared