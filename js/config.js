const BASE_URL = "http://localhost:8080/api/v1";

function saveAuthData(response) {
    if (!response) return;

    const userData = response.body || response.data || response;

    console.log("Extracted User Data Object:", userData);

    localStorage.setItem("token", userData.token || "");

    let roleValue = "";
    if (typeof userData.role === 'string') {
        roleValue = userData.role;
    } else if (userData.role && userData.role.name) {
        roleValue = userData.role.name;
    }
    localStorage.setItem("role", roleValue);

    localStorage.setItem("userCode", userData.userCode || userData.userId || "");
    localStorage.setItem("userId", userData.userId || "");
    localStorage.setItem("status", userData.status || "APPROVED");

    console.log("Saved Token:", localStorage.getItem("token"));
    console.log("Saved Role:", localStorage.getItem("role"));
}

function getToken() {
    return localStorage.getItem("token");
}

function getUserRole() {
    return localStorage.getItem("role");
}

function getUserCode() {
    return localStorage.getItem("userCode");
}

function getUserStatus() {
    return localStorage.getItem("status");
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

function checkAuthGuard() {
    const token = getToken();
    if (!token) {
        logout();
    }
}