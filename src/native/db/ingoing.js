const { contextBridge } = require('electron')
const { wrapper, parser } = require('./utils')

async function main(database) {
    contextBridge.exposeInMainWorld('ingoing', {
        //Check If Item Exists
        itemExists: (id) => {
            return wrapper(({ id }) => {
                const sql = database.exec('SELECT id FROM ingoing WHERE ID = ?', [id])
                return sql.length > 0;
            }, { id });
        },

        //ingoing list
        getAll: () => {
            return wrapper(() => {
                const sql = database.exec('SELECT * FROM ingoing_view;')
                const data = parser({
                    columns: sql[0]?.columns,
                    values: sql[0]?.values
                })
                return {
                    columns: sql[0]?.columns,
                    values: sql[0]?.values,
                    data,
                }
            }, {})
        },
        //INGOING ITE
        getOne: (props) => {
            return wrapper(({ id }) => {
                const sql = database.exec('SELECT * FROM ingoing WHERE id = ?', [id]);
                const data = parser({
                    columns: sql[0]?.columns,
                    values: sql[0]?.values
                })
                return {
                    columns: sql[0]?.columns,
                    values: sql[0]?.values,
                    data
                }
            }, { id: props.id })
        },
        //UPDATE INGOING ITEM
        updateOne: ({ row }) => {
            return wrapper(({ row }) => {
                const command = `
                UPDATE ingoing
                SET
                    product = @product,
                    quantity = @quantity,
                    shipment = @shipment,
                    arrival = @arrival,
                    arrived = @arrived,
                    supplier = @supplier,
                    timestamp = DATETIME('now')
                WHERE id = @key;
                `

                database.exec(command, {
                    '@product': row.product,
                    '@quantity': row.quantity,
                    '@shipment': row.shipment,
                    '@arrival': row.arrival,
                    '@arrived': row.arrived,
                    '@supplier': row.supplier,
                    '@key': row.id
                });
            }, { row })
        },
        //delete one
        deleteOne: ({ id }) => {
            return wrapper(({ id }) => {
                database.run('DELETE FROM ingoing WHERE id = @id', {
                    '@id': id
                })
            }, { id })
        },
        //delete many
        deleteMany: ({ ids }) => {
            return wrapper(({ ids }) => {
                const stmt = database.prepare('DELETE FROM ingoing WHERE id = ?')
                for (id of ids) {
                    stmt.run([id])
                }
                stmt.free();
            }, { ids });
        },
        //add one
        addOne: ({ row }) => {
            return wrapper(({ row }) => {
                const command = `
                INSERT INTO ingoing
                (id, product, quantity, shipment, arrival, arrived, supplier, timestamp)
                VALUES
                (@id, @product, @quantity, @shipment, @arrival, @arrived, @supplier, DATETIME('now'))
            `;
                database.run(command, {
                    '@id': row.id,
                    '@product': row.product,
                    '@quantity': row.quantity,
                    '@shipment': row.shipment,
                    '@arrival': row.arrival,
                    '@arrived': row.arrived,
                    '@supplier': row.supplier
                });
            }, { row })
        }
        //TODO (addMany)
    })
}

module.exports = main