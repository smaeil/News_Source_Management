import axios from "axios";

const api = axios.create({
    baseURL: 'localhost:3500' // base url for node express api
})