// localStorage functions: *************************************************************************

// seving JSON to localStorage
export const saveLocal = (keyName, item) => {
    if (typeof item === 'string') {
        loadLocal.setItem(keyName, item);
    } else {
        localStorage.setItem(keyName, JSON.stringify(item));
    }
}

// Loading from localStorage
export const loadLocal = (keyName) => {
    const item = JSON.parse(localStorage.getItem(keyName));

    if (item) {
        return item;
    } else {
        return null;
    }
}

// Removing from localStorage
export const removeLocal = (keyName) => {
    localStorage.removeItem(keyName);
}
