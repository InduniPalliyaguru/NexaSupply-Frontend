let approveModalBS;

document.addEventListener('DOMContentLoaded', () => {
    approveModalBS = new bootstrap.Modal(document.getElementById('approveCreditModal'));
    document.getElementById('addAdminForm').addEventListener('submit', handleAddAdmin);
    document.getElementById('approveUserForm').addEventListener('submit', handleApproveUserSubmit);
    document.getElementById('searchUser').addEventListener('input', handleUserSearch);

    loadPendingUsers();
    loadActiveUsers();
    fetchUserProfileName();
});

// Mobile Sidebar Drawer Toggle Function
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

// PASSWORD VISIBILITY TOGGLE FUNCTION
function togglePasswordVisibility() {
    const pwdInput = document.getElementById('adminPassword');
    const icon = document.getElementById('togglePasswordIcon');

    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        pwdInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

async function loadPendingUsers() {
    const token = localStorage.getItem('token');
    const tableBody = document.getElementById('pendingUsersTable');

    try {

        const response = await fetch(`${BASE_URL}/admin/users/pending`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();

        if (response.ok && response.body) {
            const pendingUsers = result.body;

            if (pendingUsers.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No pending retailer requests found.</td></tr>`;
                return;
            }
            let rowsHtml = '';
            pendingUsers.forEach(user => {
                rowsHtml += `
                    <tr>
                        <td class="fw-bold">${user.shopName || 'N/A'}</td>
                        <td>${user.fullName || 'N/A'}</td>
                        <td>${user.email || 'N/A'}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td>${user.address || 'N/A'}</td>
                        <td class="text-end">
                            <button class="btn btn-success btn-sm rounded-pill px-3 me-1" onclick="openApproveModal('${user.userCode}')">
                                <i class="fa-solid fa-check me-1"></i> Approve
                            </button>
                            <button class="btn btn-outline-danger btn-sm rounded-pill px-3" onclick="rejectUser('${user.userCode}')">
                                <i class="fa-solid fa-xmark me-1"></i> Reject
                            </button>
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = rowsHtml;
        }

    } catch (error) {
        console.error("Pending Users Load Error:", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-3">Failed to load pending users!</td></tr>`;
    }
}

function openApproveModal(userCode) {
    document.getElementById('approveUserCode').value = userCode;
    document.getElementById('creditLimitInput').value = '';
    approveModalBS.show();
}

async function handleApproveUserSubmit(event) {
    event.preventDefault();

    const userCode = document.getElementById('approveUserCode').value;
    const creditLimit = document.getElementById('creditLimitInput').value;
    const token = localStorage.getItem('token');

    try {

        const response = await fetch(`${BASE_URL}/admin/users/approve/${userCode}?creditLimit=${creditLimit}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();

        if (response.ok && (result.code === 200 || result.status === 200)) {
            alert("User approved successfully!");
            approveModalBS.hide();
            loadPendingUsers();
            loadActiveUsers();
        } else {
            alert(result.message || "Approval failed!");
        }
    } catch (error) {
        console.error("Approve Error:", error);
        alert("Server error during approval!");
    }

}

async function rejectUser(userCode) {
    if (!confirm(`Are you sure you want to reject user ${userCode}?`)) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/admin/users/reject/${userCode}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok && (result.code === 200 || result.status === 200)) {
            alert("User rejected successfully!");
            loadPendingUsers();
        } else {
            alert(result.message || "Rejection failed!");
        }
    } catch (error) {
        console.error("Reject Error:", error);
        alert("Server error during rejection!");
    }
}

async function loadActiveUsers() {
    const token = localStorage.getItem('token');
    const tableBody = document.getElementById('activeUsersTable');

    try {
        const response = await fetch(`${BASE_URL}/admin/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.body) {
            renderActiveUsersTable(result.body);
        }
    } catch (error) {
        console.error("Active Users Load Error:", error);
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-3">Failed to load active users!</td></tr>`;
    }
}

function renderActiveUsersTable(usersList) {
    const tableBody = document.getElementById('activeUsersTable');

    if (!usersList || usersList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-3">No active users found.</td></tr>`;
        return;
    }

    let rowsHtml = '';
    usersList.forEach(user => {
        const roleBadge = user.role === 'ROLE_ADMIN'
            ? `<span class="badge bg-purple text-white rounded-pill" style="background: var(--nexa-primary);">ADMIN</span>`
            : `<span class="badge bg-info text-dark rounded-pill">RETAILER</span>`;

        const formattedCredit = user.creditLimit !== null && user.creditLimit !== undefined
            ? `LKR ${Number(user.creditLimit).toLocaleString('en-US', {minimumFractionDigits: 2})}`
            : 'N/A';

        rowsHtml += `
            <tr>
                <td class="fw-bold" style="color: var(--nexa-primary);">${user.userCode || 'N/A'}</td>
                <td>${roleBadge}</td>
                <td>${user.shopName || user.fullName || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.phone || 'N/A'}</td>
                <td class="fw-bold text-success">${formattedCredit}</td>
                <td><span class="pill-badge badge-approved">${user.profileStatus || 'ACTIVE'}</span></td>
                <td class="text-end">
                    <button class="btn btn-light btn-sm rounded-circle" onclick="deleteUser('${user.userCode}')" title="Delete User">
                        <i class="fa-solid fa-trash text-danger"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = rowsHtml;
}

async function filterUsersByRole(selectedRole) {

    const roleUpper = selectedRole.trim().toUpperCase();

    if (roleUpper === 'ALL') {
        loadActiveUsers();
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/admin/users/role/${roleUpper}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (response.ok && result.body) {
            renderActiveUsersTable(result.body);
        } else {
            renderActiveUsersTable([]);
        }
    } catch (error) {
        console.error("Filter Error:", error);
    }
}

async function handleUserSearch(event) {
    const query = event.target.value.trim();

    if (query === "") {
        loadActiveUsers();
        return;
    }

    const token = localStorage.getItem('token');

    const isEmail = query.includes('@');
    const endpoint = isEmail
        ? `${BASE_URL}/admin/users/search/email?email=${encodeURIComponent(query)}`
        : `${BASE_URL}/admin/users/search/code?code=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (response.ok && result.body) {
            renderActiveUsersTable(result.body);
        }
    } catch (error) {
        console.error("Search Error:", error);
    }
}

async function deleteUser(userCode) {
    if (!confirm(`Are you sure you want to delete user ${userCode}? This action cannot be undone.`)) return;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/admin/users/${userCode}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok && (result.code === 200 || result.status === 200)) {
            alert("User deleted successfully!");
            loadActiveUsers();
        } else {
            alert(result.message || "Failed to delete user!");
        }
    } catch (error) {
        console.error("Delete Error:", error);
        alert("Server error while deleting user!");
    }
}

async function handleAddAdmin(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');

    const adminPayload = {
        fullName: document.getElementById('adminFullName').value.trim(),
        email: document.getElementById('adminEmail').value.trim(),
        password: document.getElementById('adminPassword').value.trim(),
        phone: document.getElementById('adminPhone').value.trim(),
        address: document.getElementById('adminAddress').value.trim(),
    };

    try {
        const response = await fetch(`${BASE_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adminPayload)
        });

        const result = await response.json();

        if (response.ok && (result.code === 201 || result.status === 201)) {
            alert("Admin user created successfully!");

            document.getElementById('addAdminForm').reset();
            const modalElem = document.getElementById('addAdminModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElem);
            if (modalInstance) modalInstance.hide();

            loadActiveUsers();
        } else {
            alert(result.message || "Failed to create Admin!");
        }
    } catch (error) {
        console.error("Add Admin Error:", error);
        alert("Server error while creating Admin!");
    }
}

async function fetchUserProfileName() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${BASE_URL}/users/profile`, {
            method: 'GET',
            headers: {'Authorization': `Bearer ${token}`}
        });

        const data = await response.json();
        if (response.ok || data.code === 200) {
            const user = data.body || data.data;
            if (user && user.fullName) {
                const nameElem = document.getElementById('profileName');
                if (nameElem) nameElem.innerText = user.fullName;

                const mailElem = document.getElementById('profileEmail');
                if (mailElem) mailElem.innerText = user.email || '';

                const avatarElem = document.querySelector('.user-avatar');
                if (avatarElem) avatarElem.innerText = user.fullName.charAt(0).toUpperCase();
            }
        }
    } catch (err) {
        console.error("Error fetching user profile name:", err);
    }
}
