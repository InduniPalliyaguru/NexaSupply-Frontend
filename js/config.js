const BASE_URL = "http://localhost:8080/api/v1";

(function runAuthGuard() {
    const currentPath = window.location.pathname.toLowerCase();

    const isPublicPage = currentPath.includes('index.html') ||
        currentPath.includes('pending-approval.html') ||
        currentPath.endsWith('/') ||
        currentPath === '';

    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toUpperCase();
    const status = (localStorage.getItem("status") || "").toUpperCase();

    if (!token && !isPublicPage) {
        window.location.replace('../../index.html');
        return;
    }

   if (token && role.includes('RETAILER') && status === 'PENDING' && !currentPath.includes('pending-approval.html')) {
        window.location.replace('../../pages/auth/pending-approval.html');
        return;
    }

    if (token && !isPublicPage) {
        if (currentPath.includes('/admin/') && !role.includes('ADMIN')) {
            alert("Unauthorized Access!");
            window.location.replace('../../pages/retailer/dashboard.html');
        } else if (currentPath.includes('/retailer/') && !role.includes('RETAILER')) {
            alert("Unauthorized Access!");
            window.location.replace('../../pages/admin/dashboard.html');
        }
    }
})();

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
    window.location.replace("/index.html");
}

function checkAuthGuard() {
    const token = getToken();
    if (!token) {
        logout();
    }
}