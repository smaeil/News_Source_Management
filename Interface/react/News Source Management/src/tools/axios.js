import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:3500/api' // base url for node express api
})

// This interceptor automatically attaches the token to EVERY request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.token = token;
    }
    return config;
});

export default api;