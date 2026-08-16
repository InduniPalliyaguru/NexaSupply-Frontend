document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
});

// Mobile Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

// 1. Fetch Profile Data (GET /api/v1/users/profile)
function fetchUserProfile() {

    const userProfile = {
        userCode: "ADM-1001",
        fullName: "System Super Admin",
        email: "admin@nexasupply.com",
        phone: "0770000000",
        address: "NexaSupply HQ, Colombo 03",
        role: "ADMIN",
        profileStatus: "APPROVED"
    };

    populateUI(userProfile);
}

function populateUI(data) {
    // Left Card Summary
    document.getElementById('lblUserCode').innerText = data.userCode || 'N/A';
    document.getElementById('profileDisplayName').innerText = data.fullName || '';
    document.getElementById('profileDisplayEmail').innerText = data.email || '';
    document.getElementById('badgeRole').innerText = data.role || 'USER';
    document.getElementById('badgeStatus').innerText = data.profileStatus || 'ACTIVE';

    const initial = data.fullName ? data.fullName.charAt(0).toUpperCase() : 'A';
    document.getElementById('profileAvatarLarge').innerText = initial;
    document.getElementById('headerAvatar').innerText = initial;
    document.getElementById('headerName').innerText = data.fullName || '';
    document.getElementById('headerEmail').innerText = data.email || '';

    // Form Fields
    document.getElementById('txtUserCode').value = data.userCode || '';
    document.getElementById('txtRole').value = data.role || '';
    document.getElementById('txtEmail').value = data.email || '';
    document.getElementById('txtProfileStatus').value = data.profileStatus || '';

    // Editable
    document.getElementById('txtFullName').value = data.fullName || '';
    document.getElementById('txtPhone').value = data.phone || '';
    document.getElementById('txtAddress').value = data.address || '';
}

// 2. Submit Updated Profile (PUT /api/v1/users/profile)
function handleProfileUpdate(e) {
    e.preventDefault();

    const updateDTO = {
        fullName: document.getElementById('txtFullName').value,
        phone: document.getElementById('txtPhone').value,
        address: document.getElementById('txtAddress').value
    };



    alert("Profile details updated successfully!");
}