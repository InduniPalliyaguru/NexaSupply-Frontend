let salesChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAdminDashboardData();
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
                'Authorization': `Bearer ${token}`,
                // 'Content-Type': 'application/json'
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