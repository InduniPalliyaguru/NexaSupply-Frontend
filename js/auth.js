document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
});

// LOGIN FUNCTION
async function handleLogin(event) {
    if (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        showAuthAlert("Please enter both email and password.");
        return;
    }

    hideAuthAlert();

    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: email, password: password})
        });

        const result = await response.json();
        console.log("Backend Response Details:", result);

        const isSuccess = response.ok && (result.code == 200 || result.status == 200);

        if (isSuccess) {
            console.log("SUCCESS CONDITION MET! Saving data...");

            saveAuthData(result);

            const role = (getUserRole() || "").trim().toUpperCase();
            const status = (getUserStatus() || "").trim().toUpperCase();

            console.log("Extracted Role:", role);
            console.log("Extracted Status:", status);

            if (role.includes('ADMIN')) {
                console.log("Navigating to Admin...");
                window.location.replace('pages/admin/dashboard.html');
            } else if (role.includes('RETAILER')) {
                if (status === 'PENDING') {
                    console.log("Navigating to Pending...");
                    window.location.replace('pages/auth/pending-approval.html');
                } else {
                    console.log("Navigating to Retailer Dashboard...");
                    window.location.replace('pages/retailer/dashboard.html');
                }
            } else {
                showAuthAlert("Role match failed! Got role: " + role);
            }
        } else {
            const errorMsg = (result.message || "").toLowerCase();

            if (errorMsg.includes("pending")) {
                console.log("Account is pending approval. Redirecting...");
                window.location.replace('pages/auth/pending-approval.html');
            } else {
                showAuthAlert(result.message || "Invalid credentials!");
            }
        }
    } catch (error) {
        console.error("Login Error:", error);
        showAuthAlert("Cannot connect to Backend Server!");
    }
}
// REGISTER FUNCTION
async function handleRegister(event) {
    event.preventDefault();

    const registerPayload = {
        fullName: document.getElementById('regFullName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regPassword').value.trim(),
        shopName: document.getElementById('regShopName').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        address: document.getElementById('regAddress').value.trim(),
    };

    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(registerPayload)
        });

        const result = await response.json();

        if (response.ok && result.code === 201) {
            alert("Registration successful! Account is PENDING approval.");
            toggleAuthMode();
            document.getElementById('loginEmail').value = registerPayload.email;
        } else {
            showAuthAlert(result.message || "Registration failed!");
        }
    } catch (error) {
        showAuthAlert("Server connection error!");
    }
}

// UI FUNCTIONS
function togglePasswordVisibility(inputId, iconElem) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        iconElem.classList.remove("fa-eye-slash");
        iconElem.classList.add("fa-eye");
    } else {
        input.type = "password";
        iconElem.classList.remove("fa-eye");
        iconElem.classList.add("fa-eye-slash");
    }
}

let isSignUp = false;

function toggleAuthMode() {
    isSignUp = !isSignUp;
    hideAuthAlert();

    const loginSec = document.getElementById('loginSection');
    const signupSec = document.getElementById('signupSection');
    const formTitle = document.getElementById('formTitle');
    const togglePrompt = document.getElementById('togglePrompt');

    if (isSignUp) {
        if (loginSec) loginSec.style.display = 'none';
        if (signupSec) signupSec.style.display = 'block';
        if (formTitle) formTitle.innerText = "Sign Up";
        if (togglePrompt) togglePrompt.innerHTML = 'Already have an account? <a href="javascript:void(0)" onclick="toggleAuthMode()" class="toggle-auth-link">Login here</a>';
    } else {
        if (loginSec) loginSec.style.display = 'block';
        if (signupSec) signupSec.style.display = 'none';
        if (formTitle) formTitle.innerText = "Login";
        if (togglePrompt) togglePrompt.innerHTML = 'Don\'t have an account? <a href="javascript:void(0)" onclick="toggleAuthMode()" class="toggle-auth-link">Create your account</a>';
    }
}

function showAuthAlert(msg) {
    const alertBox = document.getElementById('authAlert');
    const alertMsg = document.getElementById('alertMessage');
    if (alertBox && alertMsg) {
        alertMsg.innerText = msg;
        alertBox.classList.remove('d-none');
    }
}

function hideAuthAlert() {
    const alertBox = document.getElementById('authAlert');
    if (alertBox) alertBox.classList.add('d-none');
}