const { contextBridge } = require('electron')
const { wrapper } = require('./utils')
const { parser } = require('./utils')

async function main(database) {
    contextBridge.exposeInMainWorld('category', {
        //get all list items
        getAll: () => {
            return wrapper(() => {
                const sql = database.exec('SELECT * FROM category_items');
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
                const sql = database.run(
                    `INSERT INTO categories
                    (id, label, max, timestamp)
                    VALUES
                    (@id, @label, 1, DATETIME("now"))`,
                    { '@id': rows.id, '@label': rows.label }
                );
                return {
                    affected: 1
                }
            }, { rows })
        },
        //update one
        updateOne: ({ rows }) => {
            return wrapper(({ rows }) => {
                const sql = `
                UPDATE categories
                SET label = @label
                WHERE id = @id;
                `
                database.exec(sql, { '@id': rows.id, '@label': rows.label });
                return {
                    affectedRows: 1
                }
            }, { rows })
        },
        //delete many
        deleteMany: (ids) => {
            return wrapper((ids) => {
                const sql = `
                    DELETE FROM categories
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