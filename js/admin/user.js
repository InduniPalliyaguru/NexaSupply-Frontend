let approveModalBS;

document.addEventListener('DOMContentLoaded', () => {
    approveModalBS = new bootstrap.Modal(document.getElementById('approveCreditModal'));
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

// ROLE FILTER HANDLER
function filterUsersByRole(selectedRole) {
    if (selectedRole === 'ALL') {
        // Fetch GET /api/v1/admin/users
    } else {
        // Fetch GET /api/v1/admin/users/role/{selectedRole}
    }
}

function openApproveModal(userCode) {
    document.getElementById('approveUserCode').value = userCode;
    document.getElementById('creditLimitInput').value = '';
    approveModalBS.show();
}

function rejectUser(userCode) {
    if(confirm(`Are you sure you want to reject user ${userCode}?`)) {
        // Executed: PUT /api/v1/admin/users/reject/{userCode}
    }
}

function deleteUser(userCode) {
    if(confirm(`Are you sure you want to delete user ${userCode}?`)) {
        // Executed: DELETE /api/v1/admin/users/{userCode}
    }
}