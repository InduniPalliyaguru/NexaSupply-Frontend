document.addEventListener('DOMContentLoaded', () => {
    fetchRetailerDashboardData();
    fetchUserProfileName();
    loadNotificationCount();
    loadNotifications();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

async function fetchRetailerDashboardData() {
    const token = localStorage.getItem('token');

    if (!token) {
        alert("Session expired or unauthorized. Redirecting to login...");
        window.location.href = '../../index.html';
        return;
    }

    try {

        const response = await fetch(`${BASE_URL}/dashboard/retailer`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            const dashboardDTO = data.body || data.data;
            if (dashboardDTO) {
                renderKPIMetrics(dashboardDTO);
                renderRecentOrders(dashboardDTO.recentOrders || []);
            }
        } else {
            console.error("Failed to fetch retailer dashboard data:", data.message);
        }

    } catch (error) {
        console.error("Error fetching retailer dashboard data:", error);
    }
}

function renderKPIMetrics(dto) {
    const credit = dto.availableCreditLimit !== undefined ? dto.availableCreditLimit : 0;
    document.getElementById('statAvailableCredit').innerText = `LKR ${Number(credit).toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    document.getElementById('statPendingOrders').innerText = dto.pendingOrdersCount || 0;

    document.getElementById('statTotalOrders').innerText = dto.totalOrdersCount || 0;

    const spent = dto.totalSpentAmount !== undefined ? dto.totalSpentAmount : 0;
    document.getElementById('statTotalSpent').innerText = `LKR ${Number(spent).toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById('recentOrdersTableBody');
    tbody.innerHTML = '';

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No recent orders found</td></tr>`;
        return;
    }

    orders.forEach(ord => {
        let formattedDate = '-';
        if (ord.orderDate) {
            formattedDate = new Date(ord.orderDate).toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }

        let badgeClass = 'bg-secondary-subtle text-secondary border';

        if (ord.orderStatus === 'PENDING') {
            badgeClass = 'bg-warning-subtle text-warning border border-warning';
        } else if (ord.orderStatus === 'APPROVED') {
            badgeClass = 'bg-success-subtle text-success border border-success';
        } else if (ord.orderStatus === 'DISPATCHED') {
            badgeClass = 'bg-info-subtle text-info border border-info';
        } else if (ord.orderStatus === 'CANCELLED') {
            badgeClass = 'bg-danger-subtle text-danger border border-danger';
        }

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold text-primary">${ord.orderCode || '-'}</td>
                <td class="text-muted small">${formattedDate}</td>
                <td class="text-end fw-bold text-dark">LKR ${Number(ord.totalPrice || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="text-center">
                    <span class="badge ${badgeClass} px-3 py-2">${ord.orderStatus || '-'}</span>
                </td>
            </tr>
        `;
    });
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

async function loadNotificationCount() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${BASE_URL}/notifications/unread-count`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok || data.code === 200) {
            const count = data.body !== undefined ? data.body : (data.data || 0);
            const badge = document.getElementById('unreadBadge');
            if (badge) {
                badge.innerText = count;
                badge.style.display = count > 0 ? 'inline-block' : 'none';
            }
        }
    } catch (err) {
        console.error("Cannot load notifications", err);
    }
}

async function loadNotifications() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${BASE_URL}/notifications`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok || data.code === 200) {
            const notifications = data.body || data.data || [];
            renderNotificationList(notifications);
        }
    } catch (err) {
        console.error("Cannot load notifications", err);
    }
}

function renderNotificationList(notifications) {
    const listContainer = document.getElementById('notificationList');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (!notifications || notifications.length === 0) {
        listContainer.innerHTML = `<div class="text-center py-3 text-muted small">No notifications available</div>`;
        return;
    }

    notifications.forEach(n => {
        let timeAgo = n.createdAt ? new Date(n.createdAt).toLocaleString() : '';

        const isRead = n.isRead === true || n.read === true || n.isRead === "true" || n.read === "true";

        const bgColor = isRead ? '#ffffff' : '#eef2ff';
        const borderStyle = isRead ? 'border border-light-subtle' : 'border-start border-4 border-primary shadow-sm';
        const titleColor = isRead ? 'text-secondary fw-semibold' : 'text-primary fw-bold';

        const statusBadge = isRead
            ? `<span class="badge bg-secondary-subtle text-secondary border" style="font-size: 0.65rem;">READ</span>`
            : `<span class="badge bg-primary" style="font-size: 0.65rem;">NEW</span>`;
        listContainer.innerHTML += `
            <div class="notification-item p-2 rounded-3 mb-2 ${borderStyle} position-relative" style="background: ${bgColor}; transition: all 0.2s ease;">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="small ${titleColor}" onclick="markNotificationAsRead(${n.notificationId})" style="cursor: pointer;">
                        ${n.title || 'Notification'}
                    </div>
                    <div class="d-flex align-items-center gap-1">
                        ${statusBadge}
                        <button class="btn btn-link btn-sm text-danger p-0 ms-1" onclick="deleteNotification(${n.notificationId})" title="Delete">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
                <div class="text-muted small my-1" onclick="markNotificationAsRead(${n.notificationId})" style="font-size: 0.78rem; cursor: pointer;">
                    ${n.message || ''}
                </div>
                <div class="d-flex justify-content-between align-items-center mt-1">
                    <span class="text-muted" style="font-size: 0.7rem;">${timeAgo}</span>
                </div>
            </div>
        `;
    });
}

async function markNotificationAsRead(notificationId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            await loadNotificationCount();
            await loadNotifications();
        }
    } catch (err) {
        console.error("Cannot mark as read notification", err);
    }
}

async function markAllNotificationsAsRead() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${BASE_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            await loadNotificationCount();
            await loadNotifications();
        }
    } catch (err) {
        console.error("Cannot mark as read all notifications", err);
    }
}

async function deleteNotification(notificationId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            await loadNotificationCount();
            await loadNotifications();
        }
    } catch (err) {
        console.error("Cannot delete notification:", err);
    }
}

