const { contextBridge } = require('electron')
const { wrapper, parser } = require('./utils')

async function main(database) {
    contextBridge.exposeInMainWorld('outgoing', {
        //Check If Item Exists
        itemExists: (id) => {
            return wrapper(({ id }) => {
                const sql = database.exec('SELECT id FROM outgoing WHERE ID = ?', [id])
                return sql.length > 0;
            }, { id });
        },
        //*OUTGOING LIST
        getAll: () => {
            return wrapper(() => {
                const sql = database.exec('SELECT * FROM outgoing_view;')
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

        //*OUTGOING ITEM
        getOne: (props) => {
            return wrapper(({ id }) => {
                const sql = database.exec('SELECT * FROM outgoing WHERE id = ?', [id]);
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

        //*UPDATE INGOING ITEM
        updateOne: ({ row }) => {
            return wrapper(({ row }) => {
                //FIXME: change row info
                const command = `
                UPDATE outgoing
                SET
                    product = @product,
                    quantity = @quantity,
                    shipment = @shipment,
                    arrived = @arrived,
                    client = @client,
                    timestamp = DATETIME('now')
                WHERE id = @key;
                `

                database.exec(command, {
                    '@product': row.product,
                    '@quantity': row.quantity,
                    '@shipment': row.shipment,
                    '@arrived': row.arrived,
                    '@client': row.client,
                    '@key': row.id
                });
            }, { row })
        },
        //delete one
        deleteOne: ({ id }) => {
            return wrapper(({ id }) => {
                database.run('DELETE FROM outgoing WHERE id = @id', {
                    '@id': id
                })
            }, { id })
        },
        //delete many
        deleteMany: ({ ids }) => {
            return wrapper(({ ids }) => {
                const stmt = database.prepare('DELETE FROM outgoing WHERE id = ?')
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
                INSERT INTO outgoing
                (id, product, quantity, shipment, arrived, client, timestamp)
                VALUES
                (@id, @product, @quantity, @shipment, @arrived, @client, DATETIME('now'))
            `;
                database.run(command, {
                    '@id': row.id,
                    '@product': row.product,
                    '@quantity': row.quantity,
                    '@shipment': row.shipment,
                    '@arrived': row.arrived,
                    '@client': row.client
                });
            }, { row })
        },
        //TODO: (addMany, updateMany)
    })
}

module.exports = main
