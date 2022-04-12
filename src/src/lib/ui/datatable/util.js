/**
 * Slice the Row Array for Pagination
 * @param {Array<any>} data the array data to be sliced
 * @param {number} size pagination width
 * @returns {Array<Array<any>}
 */
function paginate(data, size = 10) {
    return new Promise((res, rej) => {
        try {
            let _start = 0;
            let _size = size
            let _sizeVariant = _size
            let _splited = []
            while (true) {
                const section = data.slice(_start, _size)
                const temp = _size
                _size = _size + _sizeVariant
                _start = temp

                if (section.length <= 0) {
                    break;
                } else {
                    _splited.push(section)
                }
            }
            return res(_splited);
        } catch (e) {
            return rej([])
        }
    });
}

/**
 * Sort Selection
 * @param {Array<any>} data data to search 
 * @param {Number} column which column to search
 * @param {boolean} asc is ascending or false
 * @returns {Array<Array<any>>}
 */
function sort(data, column = 0, asc = true) {
    return new Promise((res, rej) => {
        try {
            if (asc) {
                return res(data.sort((x, y) => (x[column] > y[column]) ? 1 : -1));
            } else {
                return res(data.sort((x, y) => (x[column] < y[column]) ? 1 : -1));
            }
        } catch (err) {
            return rej([])
        }
    })
}

/**
 * Search for String
 * @param {Array<any>} data data to be search upon to
 * @param {string} query query string for search
 * @param {{column: string}} datatype data type
 * @returns {Array<Array<any>>}
 */
function search(data, query, column) {

    return new Promise((res, rej) => {
        try {
            let searchQuery = query.toString().trim().toLowerCase()
            let pattern = new RegExp(query, 'gi')
            pattern = new RegExp(searchQuery, 'gi')
            return res(data.filter(element => element[column].toString().toLowerCase().match(pattern)))
        } catch (err) {
            return rej([])
        }
    });
}

/**
 * Parse if Format (Type) is (currency)
 * @param {string} type 
 * @param {any} value 
 * @returns 
 */

function parseColumnData(type, value) {
    switch (type) {
        case 'string':
            return value
        case 'currency':
            return "" + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
        case 'date':
            return new Date(value).toLocaleDateString();
        case 'boolean':
            return (value === 1)
        case 'number':
            return +value
        default:
            return value;
    }
}


export {
    paginate,
    search,
    sort,
    parseColumnData as parseColumn
}