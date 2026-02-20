import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

const signup = (username, email, password) => {
    return axios.post(API_URL + "signup/", {
        username,
        email,
        password,
    }).then((response) => {
        return response.data;
    });
};

const login = (username, password) => {
    return axios.post(API_URL + "login/", {
        username,
        password,
    }).then((response) => {
        if (response.data.access) {
            localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
    });
};

const logout = () => {
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

const authService = {
    signup,
    login,
    logout,
    getCurrentUser,
};

export default authService;
