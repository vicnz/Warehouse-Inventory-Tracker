export function sanitizeColumnName(item) {
    return item.replace(/[-_~]+/, ' ')
}

export function sanitize(data, exceptions = []) {
    const keys = Object.keys(data);
    const isBlank = keys.every((key) => {
        if (key in exceptions) {
            return true;
        } else if (
            data[key]?.toString()?.length < 1 ||
            data[key]?.toString() === "0"
        ) {
            return false;
        } else {
            return true;
        }
    });
    return isBlank;
}

export function toClientDate(datestring) {
    const date = new Date(datestring);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

export function toDatabaseDate(datestring) {
    const date = new Date(datestring);
    return date.toLocaleDateString();
}