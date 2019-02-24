
import API from './api.js';
const api = new API();


export function login(username, password) {
    let login = api.loginApi(username, password);
    login.then(rsult => {
        return rsult;
    })
}


export function signup(username, password, email, name) {
    let login = api.signupApi(username, password, email, name);
    login.then(rsult => {
        if (rsult.token)
            return rsult.token;
        else
            return rsult.message;
    })
}