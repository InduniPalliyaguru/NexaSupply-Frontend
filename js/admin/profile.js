document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

async function fetchUserProfile() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert("Session expired or user not logged in. Redirecting to login...");
        window.location.href = '../../index.html';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            const userProfile = data.body || data.data;
            populateUI(userProfile);
        } else {
            alert(data.message || "Failed to fetch profile details.");
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        alert("Error connecting to the server. Please check your network.");
    }
}

function populateUI(data) {
    if (!data) return;

    document.getElementById('lblUserCode').innerText = data.userCode || 'N/A';
    document.getElementById('profileDisplayName').innerText = data.fullName || 'Admin User';
    document.getElementById('profileDisplayEmail').innerText = data.email || 'N/A';
    document.getElementById('badgeRole').innerText = data.role || 'ADMIN';
    document.getElementById('badgeStatus').innerText = data.profileStatus || 'ACTIVE';

    const initial = data.fullName ? data.fullName.charAt(0).toUpperCase() : 'A';
    document.getElementById('profileAvatarLarge').innerText = initial;
    document.getElementById('headerAvatar').innerText = initial;
    document.getElementById('headerName').innerText = data.fullName || 'Admin User';
    document.getElementById('headerEmail').innerText = data.email || 'N/A';

    document.getElementById('txtUserCode').value = data.userCode || '';
    document.getElementById('txtRole').value = data.role || '';
    document.getElementById('txtEmail').value = data.email || '';
    document.getElementById('txtProfileStatus').value = data.profileStatus || '';

    document.getElementById('txtFullName').value = data.fullName || '';
    document.getElementById('txtPhone').value = data.phone || '';
    document.getElementById('txtAddress').value = data.address || '';
}

async function handleProfileUpdate(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const btnSave = document.getElementById('btnSaveProfile');

    if (!token) {
        alert("Session expired. Please log in again.");
        window.location.href = '../../index.html';
        return;
    }

    const updateDTO = {
        fullName: document.getElementById('txtFullName').value.trim(),
        phone: document.getElementById('txtPhone').value.trim(),
        address: document.getElementById('txtAddress').value.trim(),
        shopName: null
    };

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(updateDTO.phone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    btnSave.disabled = true;
    btnSave.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> Updating...`;

    try {
        const response = await fetch(`${BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateDTO)
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            alert(data.message || "Profile details updated successfully!");

            const updatedProfile = data.body || data.data;
            if (updatedProfile) {
                populateUI(updatedProfile);
            } else {
                await fetchUserProfile();
            }
        } else {
            alert(data.message || "Failed to update profile details.");
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        alert("Error connecting to the server. Please try again.");
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Update Profile`;
    }
}