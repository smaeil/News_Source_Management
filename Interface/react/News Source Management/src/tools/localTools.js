// localStorage functions: *************************************************************************

// seving JSON to localStorage
export const saveLocal = (keyName, item) => {
    if (typeof item === 'string') {
        localStorage.setItem(keyName, item);
    } else {
        localStorage.setItem(keyName, JSON.stringify(item));
    }
}

// Loading from localStorage
export const loadLocal = (keyName) => {
    try {
        const item = JSON.parse(localStorage.getItem(keyName));
        return item ? item : null;
    } catch (error) {
        const item = localStorage.getItem(keyName);
        return item ? item : null;
    }
}

// Removing from localStorage
export const removeLocal = (keyName) => {
    localStorage.removeItem(keyName);
}
