// imports
import {api} from '../config.js';

// data fetch function: *****************************************************************************

// getting data from Url with GET method
export const getData = async (path) => {
    try {
        const url = api + path;
        const res = await fetch(url, {method: 'GET'});

        if (!res.ok) throw new Error(`Error on getting from ${url}`);

        const data = await res.json();

        return data;

    } catch (error) {

        return null;
    }
}

// post form-Data
export const postData = async (path, bodyData) => {
    try {
        const url = api + path;
        const res = await fetch(url, {method: 'POST', body: bodyData});

        if (!res.ok) throw new Error(`Error on posting to ${url}`); 

        const data = await res.json();

        return data;
        
    } catch (error) {
        
        return null
    }
}

// put form-Data
export const putData = async (path, bodyData) => {
    try {
        const url = api + path;
        const res = await fetch(url, {method: 'PUT', body: bodyData});

        if (!res.ok) throw new Error(`Error on putting in ${url}`); 

        const data = await res.json();

        return data;
        
    } catch (error) {

        return null
    }
}


// patch form-Data
export const patchData = async (path, bodyData) => {
    try {
        const url = api + path;
        const res = await fetch(url, {method: 'PATCH', body: bodyData});

        if (!res.ok) throw new Error(`Error on patching the ${url}`); 

        const data = await res.json();

        return data;
        
    } catch (error) {
        
        return null
    }
}