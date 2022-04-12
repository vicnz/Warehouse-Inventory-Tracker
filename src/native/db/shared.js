const { contextBridge } = require('electron')
const { wrapper } = require('./utils')

function shared(database) {
    contextBridge.exposeInMainWorld('shared', {
        //get product list
        productList: () => {
            return wrapper(() => {
                const sql = database.exec('SELECT id, product, description, quantity FROM inventory')
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
        //product list item
        productListItem: (item) => {
            return wrapper(({ id }) => {
                const sql = database.exec('SELECT product, description FROM master WHERE id = ?', ['1'])
                let data = {};
                let index = 0;
                for (item of sql[0]?.values) {
                    data = {
                        ...data,
                        [sql[0]?.columns[idx]]: item
                    }
                    index++;
                }
                return data;
            }, { id: item.id })
        }
    })
}

module.exports = shared