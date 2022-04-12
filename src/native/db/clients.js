/**
 * TODO ITEMS:
 * 1. AddMany (Supplier)
 * 2. AddMany (Customer) 
 */
const { contextBridge } = require('electron')
const { wrapper, parser } = require('./utils')

function clients(database) {
    contextBridge.exposeInMainWorld('clients', {
        //* SUPPLIERS
        //GET ALL (Suppliers)
        getSuppliers: () => {
            return wrapper(() => {
                const sql = `
                SELECT
                    id, name, company, address, contact, email
                FROM
                    clients_supplier
                `
                const result = database.exec(sql);
                return {
                    columns: result[0]?.columns,
                    values: result[0]?.values
                }
            }, {});
        },
        //GET ONE
        getOneSupplier: (id) => {
            return wrapper((id) => {
                const command = `
                SELECT
                    id, name, company, address, contact, email
                FROM
                    clients
                WHERE type = 'supplier' AND id = ?;
                `
                const sql = database.exec(command, [id]);
                return {
                    data: parser({ columns: sql[0]?.columns, values: sql[0]?.values, })
                }
            }, id)
        },
        //UPDATE ONE (Supplier)
        updateOneSupplier: ({ rows }) => {
            return wrapper(({ rows }) => {
                const sql = `
                UPDATE clients
                SET
                    name = @name,
                    company = @company,
                    address = @address,
                    contact = @contact,
                    email = @email,
                    timestamp = DATETIME('now')
                WHERE
                    id = @key
                    AND
                    type = 'supplier';
                `
                const run = database.run(sql, {
                    '@name': rows.name,
                    '@company': rows.company,
                    '@address': rows.address,
                    '@contact': rows.contact,
                    '@email': rows.email,
                    '@key': rows.id
                });

            }, { rows })
        },
        //ADD ONE (Supplier)
        addOneSupplier: ({ rows }) => {
            return wrapper(({ rows }) => {
                const sql = `
                INSERT INTO clients
                    (id, name, company, address, contact, email, type, timestamp)
                VALUES
                    (@id, @name, @company, @address, @contact, @email, 'supplier', DATETIME('now'));
                `
                const run = database.run(sql, {
                    '@id': rows.id,
                    '@name': rows.name,
                    '@company': rows.company,
                    '@address': rows.address,
                    '@contact': rows.contact,
                    '@email': rows.email
                })

            }, { rows })
        },
        //DELETE ONE (Supplier)
        deleteOneSupplier: ({ id }) => {
            return wrapper(({ id }) => {
                const sql = database.run('DELETE FROM clients WHERE id = ?', [id]);
            }, { id })
        },
        deleteManySupplier: ({ ids }) => {
            return wrapper((ids) => {
                const sql = `
                    DELETE FROM clients
                    WHERE id = ?
                `
                const smt = database.prepare(sql)
                for (id of ids) {
                    smt.run([id])
                }
                smt.free();
            }, ids)
        },
        //* CUSTOMERS
        getCustomers: () => {
            return wrapper(() => {
                const sql = `
                SELECT
                    id, name, company, address, contact, email
                FROM
                    clients_customer
                `
                const result = database.exec(sql);
                return {
                    columns: result[0]?.columns,
                    values: result[0]?.values
                }
            }, {});
        },
        //GET ONE
        getOneCustomer: (id) => {
            return wrapper((id) => {
                const command = `
                SELECT
                    id, name, company, address, contact, email
                FROM
                    clients
                WHERE type = 'customer' AND id = ?;
                `
                const sql = database.exec(command, [id]);
                return {
                    data: parser({ columns: sql[0]?.columns, values: sql[0]?.values, })
                }
            }, id)
        },
        //UPDATE ONE (Customer)
        updateOneCustomer: ({ rows }) => {
            return wrapper(({ rows }) => {
                const sql = `
                UPDATE clients
                SET
                    id = @id,
                    name = @name,
                    company = @company,
                    address = @address,
                    contact = @contact,
                    email = @email,
                    timestamp = DATETIME('now')
                WHERE
                    id = @key
                    AND
                    type = 'customer';
                `
                const run = database.run(sql, {
                    '@id': rows.id,
                    '@name': rows.name,
                    '@company': rows.company,
                    '@address': rows.address,
                    '@contact': rows.contact,
                    '@email': rows.email,
                    '@key': rows.id
                });

            }, { rows })
        },
        //ADD ONE (Customer)
        addOneCustomer: ({ rows }) => {
            return wrapper(({ rows }) => {
                const sql = `
                INSERT INTO clients
                    (id, name, company, address, contact, email, type, timestamp)
                VALUES
                    (@id, @name, @company, @address, @contact, @email, 'customer', DATETIME('now'));
                `
                const run = database.run(sql, {
                    '@id': rows.id,
                    '@name': rows.name,
                    '@company': rows.company,
                    '@address': rows.address,
                    '@contact': rows.contact,
                    '@email': rows.email
                })

            }, { rows })
        },
        //DELETE ONE (Customer)
        deleteOneCustomer: ({ id }) => {
            return wrapper(({ id }) => {
                const sql = database.run('DELETE FROM clients WHERE id = ?', [id]);
            }, { id })
        },
        //DELETE MANY (Customer)
        deleteManyCustomer: ({ ids }) => {
            return wrapper((ids) => {
                const sql = `
                    DELETE FROM clients
                    WHERE id = ?
                `
                const smt = database.prepare(sql)
                for (id of ids) {
                    smt.run([id])
                }
                smt.free();
            }, ids)
        },
    })
}

module.exports = clients;