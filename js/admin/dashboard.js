
let salesChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAdminDashboardData();
    fetchUnreadNotificationCount();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

// GET /api/v1/dashboard/admin
function loadAdminDashboardData() {
    fetch('/api/v1/dashboard/admin', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(response => {
            if (response.code === 200 && response.data) {
                const data = response.data;

                // 1. KPI Cards Mapping
                document.getElementById('statTotalRevenue').innerText = 'LKR ' + (data.totalRevenue || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                document.getElementById('statPendingOrders').innerText = data.pendingOrderCount || 0;
                document.getElementById('statLowStock').innerText = data.lowStockProductsCount || 0;
                document.getElementById('statActiveRetailers').innerText = data.activeRetailersCount || 0;

                // 2. Render Monthly Sales Chart & Table
                renderMonthlySales(data.monthlySales || []);
            }
        })
        .catch(err => console.error("Error loading admin dashboard data:", err));
}

function renderMonthlySales(monthlySalesList) {
    const labels = monthlySalesList.map(item => item.month);
    const salesData = monthlySalesList.map(item => item.totalSales);

    // Render Summary Table
    const tableBody = document.getElementById('monthlySalesTableBody');
    tableBody.innerHTML = '';

    if (monthlySalesList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="2" class="text-center text-muted py-3">No monthly sales records found.</td></tr>`;
    } else {
        monthlySalesList.forEach(item => {
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
    }

    // Render Chart.js Bar Chart
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
                data: salesData,
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

// Notification Handlers
function fetchUnreadNotificationCount() {

    const count = 1;
    const badge = document.getElementById('unreadBadge');
    if (count > 0) {
        badge.innerText = count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function loadNotifications() {
}

function markNotificationAsRead(id) {
}

function markAllNotificationsAsRead() {
}

function deleteNotification(id) {
}