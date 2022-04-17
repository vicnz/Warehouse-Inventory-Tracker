const { contextBridge } = require('electron')
const { wrapper, parser } = require('./utils')

async function main(database) {
    contextBridge.exposeInMainWorld('warehouse', {
        //Check If Item Exists
        itemExists: (id) => {
            return wrapper(({ id }) => {
                const sql = database.exec('SELECT id FROM warehouses WHERE ID = ?', [id])
                return sql.length > 0;
            }, { id });
        },
        //get all list items
        getAll: () => {
            return wrapper(() => {
                const sql = database.exec('SELECT * FROM warehouse_items');
                const data = parser({ columns: sql[0]?.columns, values: sql[0]?.values });
                return {
                    data,
                    columns: sql[0]?.columns,
                    values: sql[0]?.values,
                };
            }, {})
        },
        //addOne
        addOne: ({ rows }) => {
            return wrapper(({ rows }) => {
                database.exec(
                    `INSERT INTO warehouses
                    (id, label, location, timestamp)
                    VALUES
                    (@id, @label, @location, DATETIME("now"))`,
                    {
                        '@id': rows.id,
                        '@label': rows.label,
                        '@location': rows.location
                    }
                );
            }, { rows })
        },
        //update one
        updateOne: ({ rows }) => {
            return wrapper(({ rows }) => {
                const sql = `
                UPDATE warehouses
                SET
                    label = @label,
                    location = @location
                WHERE id = @id;
                `
                database.exec(sql, {
                    '@id': rows.id,
                    '@label': rows.label,
                    '@location': rows.location
                });

            }, { rows })
        },
        //delete many
        deleteMany: (ids) => {
            return wrapper((ids) => {
                const sql = `
                    DELETE FROM warehouses
                    WHERE id = ?
                `
                const smt = database.prepare(sql)
                for (id of ids) {
                    smt.run([id])
                }
                smt.free();
            }, ids)
        }
    })
}

module.exports = main