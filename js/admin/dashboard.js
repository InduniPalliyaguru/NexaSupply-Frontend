let salesChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAdminDashboardData();
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

async function loadAdminDashboardData() {

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/dashboard/admin`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        console.log("Dashboard Data Response:", result);

        if (response.ok && (result.code === 200 || result.status === 200) && result.body) {
            const data = result.body;

            document.getElementById('statTotalRevenue').innerText = 'LKR ' + (data.totalRevenue || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            document.getElementById('statPendingOrders').innerText = data.pendingOrderCount || 0;
            document.getElementById('statLowStock').innerText = data.lowStockProductsCount || 0;
            document.getElementById('statActiveRetailers').innerText = data.activeRetailersCount || 0;

            renderMonthlySales(data.monthlySales || []);
        } else {
            console.error("Failed to load dashboard data:", result.message);
        }
    } catch (error) {
        console.error("Dashboard API Fetch Error:", error);
    }
}

function renderMonthlySales(monthlySalesList) {
    const tableBody = document.getElementById('monthlySalesTableBody');
    tableBody.innerHTML = '';

    if (monthlySalesList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="2" class="text-center text-muted py-3">No monthly sales records found.</td></tr>`;
        return;
    }

    const monthsArr = [];
    const salesArr = [];

    monthlySalesList.forEach(item => {
        monthsArr.push(item.month);
        salesArr.push(item.totalSales);

        const formattedAmount = 'LKR ' + (item.totalSales || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        tableBody.innerHTML += `
            <tr>
                <td class="fw-semibold text-dark">${item.month}</td>
                <td class="text-end fw-bold text-success">${formattedAmount}</td>
            </tr>
        `;
    });

    drawSalesChart(monthsArr, salesArr);
}

function drawSalesChart(labels, dataValues) {
    const ctx = document.getElementById('monthlySalesChart').getContext('2d');

    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Sales (LKR)',
                data: dataValues,
                backgroundColor: 'rgba(79, 70, 229, 0.85)',
                borderColor: '#4f46e5',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {display: false}
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return 'LKR ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
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
            headers: {'Authorization': `Bearer ${token}`}
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
        console.error("Cannot load notification count", err);
    }
}

async function loadNotifications() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${BASE_URL}/notifications`, {
            method: 'GET',
            headers: {'Authorization': `Bearer ${token}`}
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
            <div class="notification-item p-2 rounded-3 mb-2 ${borderStyle} position-relative" 
                 style="background-color: ${bgColor} !important; transition: all 0.2s ease;">
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
            headers: {'Authorization': `Bearer ${token}`}
        });
        if (response.ok) {
            await loadNotificationCount();
            await loadNotifications();
        }
    } catch (err) {
        console.error("Cannot mark notification as read", err);
    }
}

async function markAllNotificationsAsRead() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${BASE_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: {'Authorization': `Bearer ${token}`}
        });
        if (response.ok) {
            await loadNotificationCount();
            await loadNotifications();
        }
    } catch (err) {
        console.error("Cannot mark all notifications as read", err);
    }
}

async function deleteNotification(notificationId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${token}`}
        });
        if (response.ok) {
            await loadNotificationCount();
            await loadNotifications();
        }
    } catch (err) {
        console.error("Cannot delete notification", err);
    }
}