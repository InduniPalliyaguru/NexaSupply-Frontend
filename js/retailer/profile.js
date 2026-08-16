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
    // Dummy UserResponseDTO data for preview
    const userProfile = {
        userCode: "RET-4092",
        fullName: "SuperMart Perera",
        email: "retailer@nexasupply.com",
        shopName: "SuperMart City Store",
        phone: "0771234567",
        address: "No 45, Main Street, Kandy",
        role: "ROLE_RETAILER",
        profileStatus: "APPROVED",
        creditLimit: 500000.00
    };

    populateUI(userProfile);
}

function populateUI(data) {
    // Left Column Summary
    document.getElementById('lblUserCode').innerText = data.userCode || 'N/A';
    document.getElementById('profileDisplayName').innerText = data.fullName || '';
    document.getElementById('profileDisplayShop').innerHTML = `<i class="fa-solid fa-store me-1 text-primary"></i> ${data.shopName || 'N/A'}`;
    document.getElementById('profileDisplayEmail').innerText = data.email || '';
    document.getElementById('badgeRole').innerText = data.role ? data.role.replace('ROLE_', '') : 'RETAILER';
    document.getElementById('badgeStatus').innerText = data.profileStatus || 'APPROVED';

    const formattedCredit = 'LKR ' + (data.creditLimit || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    document.getElementById('lblCreditLimit').innerText = formattedCredit;

    // Avatar Initial
    const initial = data.fullName ? data.fullName.charAt(0).toUpperCase() : 'R';
    document.getElementById('profileAvatarLarge').innerText = initial;
    document.getElementById('headerAvatar').innerText = initial;
    document.getElementById('headerName').innerText = data.fullName || 'Retailer User';
    document.getElementById('headerEmail').innerText = data.email || '';

    // Form Fields (Read-Only)
    document.getElementById('txtUserCode').value = data.userCode || '';
    document.getElementById('txtRole').value = data.role || '';
    document.getElementById('txtEmail').value = data.email || '';
    document.getElementById('txtProfileStatus').value = data.profileStatus || '';
    document.getElementById('txtCreditLimit').value = formattedCredit;

    // Form Fields (Editable)
    document.getElementById('txtFullName').value = data.fullName || '';
    document.getElementById('txtShopName').value = data.shopName || '';
    document.getElementById('txtPhone').value = data.phone || '';
    document.getElementById('txtAddress').value = data.address || '';
}

// 2. Submit Updated Profile (PUT /api/v1/users/profile)
function handleProfileUpdate(e) {
    e.preventDefault();

    const updateDTO = {
        fullName: document.getElementById('txtFullName').value,
        shopName: document.getElementById('txtShopName').value,
        phone: document.getElementById('txtPhone').value,
        address: document.getElementById('txtAddress').value
    };

    alert("Profile & Shop details updated successfully!");
}