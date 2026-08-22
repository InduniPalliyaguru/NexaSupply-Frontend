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

async function fetchUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../index.html';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && (result.code === 200 || result.status === 200)) {
            const userProfile = result.body || result.data;
            if (userProfile) {
                populateUI(userProfile);
            }
        } else {
            console.error("Profile Load Error:", result.message);
        }
    } catch (error) {
        console.error("Fetch Profile Error:", error);
    }
}

function populateUI(data) {

    const lblUserCode = document.getElementById('lblUserCode');
    const profileDisplayName = document.getElementById('profileDisplayName');
    const profileDisplayShop = document.getElementById('profileDisplayShop');
    const profileDisplayEmail = document.getElementById('profileDisplayEmail');
    const badgeRole = document.getElementById('badgeRole');
    const badgeStatus = document.getElementById('badgeStatus');

    if (lblUserCode) lblUserCode.innerText = data.userCode || 'N/A';
    if (profileDisplayName) profileDisplayName.innerText = data.fullName || '';
    if (profileDisplayShop) profileDisplayShop.innerHTML = `<i class="fa-solid fa-store me-1 text-primary"></i> ${data.shopName || 'N/A'}`;
    if (profileDisplayEmail) profileDisplayEmail.innerText = data.email || '';
    if (badgeRole) badgeRole.innerText = data.role ? String(data.role).replace('ROLE_', '') : 'RETAILER';
    if (badgeStatus) badgeStatus.innerText = data.profileStatus || 'APPROVED';

    const formattedCredit = 'LKR ' + Number(data.creditLimit || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const lblCreditLimit = document.getElementById('lblCreditLimit');
    if (lblCreditLimit) lblCreditLimit.innerText = formattedCredit;

    const initial = data.fullName ? data.fullName.charAt(0).toUpperCase() : 'R';
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    const headerAvatar = document.getElementById('headerAvatar');
    const headerName = document.getElementById('headerName');
    const headerEmail = document.getElementById('headerEmail');

    if (profileAvatarLarge) profileAvatarLarge.innerText = initial;
    if (headerAvatar) headerAvatar.innerText = initial;
    if (headerName) headerName.innerText = data.fullName || 'Retailer User';
    if (headerEmail) headerEmail.innerText = data.email || '';

    document.getElementById('txtUserCode').value = data.userCode || '';
    document.getElementById('txtRole').value = data.role || '';
    document.getElementById('txtEmail').value = data.email || '';
    document.getElementById('txtProfileStatus').value = data.profileStatus || '';
    document.getElementById('txtCreditLimit').value = formattedCredit;

    document.getElementById('txtFullName').value = data.fullName || '';
    document.getElementById('txtShopName').value = data.shopName || '';
    document.getElementById('txtPhone').value = data.phone || '';
    document.getElementById('txtAddress').value = data.address || '';
}


async function handleProfileUpdate(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) return;

    const updateDTO = {
        fullName: document.getElementById('txtFullName').value.trim(),
        shopName: document.getElementById('txtShopName').value.trim(),
        phone: document.getElementById('txtPhone').value.trim(),
        address: document.getElementById('txtAddress').value.trim()
    };

    const btnSave = document.getElementById('btnSaveProfile');
    if (btnSave) {
        btnSave.disabled = true;
        btnSave.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Updating...`;
    }

    try {
        const response = await fetch(`${BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateDTO)
        });

        const result = await response.json();

        if (response.ok && (result.code === 200 || result.status === 200)) {
            alert(result.message || "Profile updated successfully!");
            const updatedUser = result.body || result.data;
            if (updatedUser) {
                populateUI(updatedUser);
            } else {
                await fetchUserProfile();
            }
        } else {
            alert(result.message || "Failed to update profile!");
        }
    } catch (error) {
        console.error("Profile Update Error:", error);
        alert("An error occurred while updating profile.");
    } finally {
        if (btnSave) {
            btnSave.disabled = false;
            btnSave.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Update Profile Details`;
        }
    }
}