
// parsing Boolean from String
export const boolParse = function(input) {
    try {
        if (typeof input === 'boolean') return input;
        return (/true/i).test(input);
    } catch (error) {
        return false;
    }
}

// Capitalizing the first letter of an string:
export const capitalize = (txt) => {
    if (!txt) {
        return txt;
    }
    if (typeof txt !== 'string') { txt = String(txt)}
    txt = txt.trim();
    return txt[0].toUpperCase() + txt.slice(1).toLowerCase();
}


// Capitizing the first letter of each word in a sentence.
export const titleCase = (txt) => {
    if (!txt) {
        return txt;
    }
    if (typeof txt !== 'string') { txt = String(txt)}
    txt = txt.trim();
    return txt.split(' ').map(item => capitalize(item)).join(' ');
}

// json to text with Space
export const jToString = (jObj) => {
    jObj = JSON.stringify(jObj).replaceAll('{', '').replaceAll('}', '').replaceAll('[', '').replaceAll(']', '').replaceAll(':', '').replaceAll(',', '').replaceAll(' ', '"');
    jObj = jObj.split('"').filter(item => item !== '').join(' ');

    return jObj;
}