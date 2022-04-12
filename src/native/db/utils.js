//*WRAPPER FUNCTION
exports.wrapper = async function Wrapper(fn, props = {}) {
    return new Promise((resolve, reject) => {
        try {
            return resolve(fn(props)); //call in function
        } catch (err) {
            console.log(err)
            return reject({ error: err })
        }
    })
}

//parse the object returned
/**
 * *PARSES ROW and COLUMNS
 * @param {Array} columns 
 * @param {Array} values 
 */
exports.parser = function main({ columns = [], values = [] }) {
    let data = [];
    data = values.map((element) => {
        let row = {};
        for (let idx = 0; idx < element.length; idx++) {
            row = {
                ...row,
                [columns[idx]]: element[idx]
            }
        }
        return row;
    });

    return data;
}