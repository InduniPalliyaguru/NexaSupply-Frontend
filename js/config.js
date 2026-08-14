const BASE_URL = "http://localhost:8080/api/v1";

function saveAuthData(userData) {
    if (!userData) return;

    localStorage.setItem("token", userData.token);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("userCode", userData.userCode);
    localStorage.setItem("userId", userData.userId);
}

function getToken() {
    return localStorage.getItem("token")
}

function getUserRole() {
    return localStorage.getItem("role");
}

function getUserCode() {
    return localStorage.getItem("userCode");
}

function logout() {
    localStorage.clear();
    window.location.href = "../index.html";
}

function checkAuthGuard() {
    const token = getToken();
    if (!token) {
        logout();
    }
}

async function authFetch(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: headers
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (response.status === 401 || response.status === 403) {
            console.warn("Unauthorized access or session expired. Redirecting to login...");
            logout();
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Network / API Error:", error);
        throw error;
    }
}