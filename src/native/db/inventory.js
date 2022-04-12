const { contextBridge } = require('electron')
const { wrapper, parser } = require('./utils')

//Inventory
async function inventory(database) {
    contextBridge.exposeInMainWorld('inventory', {
        //inventory list
        getAll: () => {
            return wrapper((props) => {
                const sql = database.exec('SELECT * FROM inventory')
                const data = parser({
                    columns: sql[0]?.columns,
                    values: sql[0]?.values
                });

                return {
                    columns: sql[0]?.columns,
                    values: sql[0]?.values,
                    data
                }
            }, {});
        },
        //inventory item
        getOne: async (props) => {
            return wrapper(({ id }) => {
                const sql = database.exec('SELECT * FROM master WHERE id = ?', [id])
                const data = parser({
                    columns: sql[0]?.columns,
                    values: sql[0]?.values
                });
                return {
                    columns: sql[0]?.columns,
                    values: sql[0]?.values,
                    data
                }
            }, { id: props.id })
        },
        //update inventory item
        updateOne: async ({ row }) => {
            return wrapper(({ row }) => {
                const command = `
                UPDATE master
                SET
                    id = @id,
                    product = @product,
                    description = @description,
                    category = @category,
                    quantity = @quantity,
                    max = @max,
                    unit_price = @unit_price,
                    warehouse = @warehouse,
                    timestamp = DATETIME('now')
                WHERE id = @key;
                `

                const sql = database.run(command, {
                    '@id': row.id,
                    '@product': row.product,
                    '@description': row.description,
                    '@category': row.category,
                    '@quantity': row.quantity,
                    '@max': row.max,
                    '@unit_price': row.unit_price,
                    '@warehouse': row.warehouse,
                    '@key': row.id,
                })

                return { success: true };
            }, { row })
        },
        //delete item
        deleteOne: (props) => {
            return wrapper(({ id }) => {
                const sql = database.run(`DELETE FROM master WHERE id = ?`, [id]);
                return sql;
            }, { id: props.id })
        },
        //delete multiple
        deleteMany: (props) => {
            return wrapper(({ ids }) => {
                const stmt = database.prepare('DELETE FROM master WHERE id = ?')
                for (id of ids) {
                    stmt.run([id])
                }
                stmt.free();

            }, { ids: props.ids });
        },
        //add inventory item
        addOne: ({ row }) => {
            return wrapper(({ row }) => {
                const command = `
                    INSERT INTO master
                    (id, product, description, category, quantity, max, unit_price, warehouse, timestamp)
                    VALUES
                    (@id, @product, @description, @category, @quantity, @max, @unit_price, @warehouse, DATETIME('now'))
                `;
                const sql = database.run(command, {
                    '@id': row.id,
                    '@product': row.product,
                    '@description': row.description,
                    '@category': row.category,
                    '@quantity': row.quantity,
                    '@max': row.max,
                    '@unit_price': row.unit_price,
                    '@warehouse': row.warehouse
                });

            }, { row })
        },
        //TODO: (addMany, updateMany)
    })
}

module.exports = inventory;