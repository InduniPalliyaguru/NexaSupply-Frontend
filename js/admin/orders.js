let viewOrderModalBS;
let allOrdersList = [];

document.addEventListener('DOMContentLoaded', () => {
    viewOrderModalBS = new bootstrap.Modal(document.getElementById('viewOrderModal'));
    loadAllOrders();
    fetchUserProfileName();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

async function loadAllOrders() {
    const token = localStorage.getItem('token');
    try {

        const response = await fetch(`${BASE_URL}/orders`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (response.ok || data.code === 200) {
            allOrdersList = data.body || data.data || [];

            const pendingOrders = allOrdersList.filter(o => o.orderStatus === 'PENDING');
            renderPendingOrders(pendingOrders);
            renderAllOrders(allOrdersList);
        } else {
            console.error("Orders load කිරීමට නොහැකි විය:", data.message);
        }

    } catch (err) {
        console.error('Error fetching orders:', err);
    }
}

function renderPendingOrders(pendingOrders) {
    const tbody = document.getElementById('pendingOrdersTableBody');
    document.getElementById('pendingBadgeCount').innerText = pendingOrders.length;

    tbody.innerHTML = '';

    if (!pendingOrders || pendingOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No pending orders waiting for approval.</td></tr>';
        return;
    }

    pendingOrders.forEach(o => {
        let formattedDate = o.orderDate ? new Date(o.orderDate).toLocaleString() : '-';
        let priceFormatted = o.totalPrice ? o.totalPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) : '0.00';

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold" style="color: var(--nexa-primary);">${o.orderCode}</td>
                <td>${o.customerEmail || '-'}</td>
                <td class="text-muted small">${formattedDate}</td>
                <td class="fw-bold text-dark">LKR ${priceFormatted}</td>
                <td><span class="badge badge-status-pending rounded-pill px-3 py-2">${o.orderStatus}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-secondary me-1 rounded-pill"
                            onclick="viewOrderDetails('${o.orderCode}')">
                        <i class="fa-solid fa-eye me-1"></i> View
                    </button>
                    <button class="btn btn-sm btn-success me-1 rounded-pill"
                            onclick="updateOrderStatus('${o.orderCode}', 'APPROVED')">
                        <i class="fa-solid fa-check me-1"></i> Approve
                    </button>
                    <button class="btn btn-sm btn-danger rounded-pill"
                            onclick="updateOrderStatus('${o.orderCode}', 'CANCELLED')">
                        <i class="fa-solid fa-xmark me-1"></i> Cancel
                    </button>
                </td>
            </tr>
        `;
    });
}

function renderAllOrders(orders) {
    const tbody = document.getElementById('allOrdersTableBody');
    tbody.innerHTML = '';

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No master orders found.</td></tr>';
        return;
    }

    orders.forEach(o => {
        let formattedDate = o.orderDate ? new Date(o.orderDate).toLocaleString() : '-';
        let priceFormatted = o.totalPrice ? o.totalPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) : '0.00';

        let statusBadgeClass = 'bg-secondary';
        if (o.orderStatus === 'PENDING') statusBadgeClass = 'badge-status-pending';
        else if (o.orderStatus === 'APPROVED') statusBadgeClass = 'badge-status-approved';
        else if (o.orderStatus === 'DISPATCHED') statusBadgeClass = 'badge-status-dispatched';
        else if (o.orderStatus === 'CANCELLED') statusBadgeClass = 'bg-danger';

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold" style="color: var(--nexa-primary);">${o.orderCode}</td>
                <td>${o.customerEmail || '-'}</td>
                <td class="text-muted small">${formattedDate}</td>
                <td class="fw-bold text-dark">LKR ${priceFormatted}</td>
                <td><span class="badge ${statusBadgeClass} rounded-pill px-3 py-2">${o.orderStatus}</span></td>
                <td class="text-center">
                    <button class="btn btn-outline-danger btn-sm rounded-pill px-3"
                            onclick="downloadInvoicePdf('${o.orderCode}')">
                        <i class="fa-solid fa-file-pdf me-1"></i> PDF
                    </button>
                </td>
                <td class="text-end">
                    <button class="btn btn-light btn-sm rounded-circle"
                            onclick="viewOrderDetails('${o.orderCode}')">
                        <i class="fa-solid fa-eye text-secondary"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

async function updateOrderStatus(orderCode, newStatus) {
    if (!['APPROVED', 'CANCELLED'].includes(newStatus)) {
        alert('Admin can only set status to APPROVED or CANCELLED manually.');
        return;
    }

    if (!confirm(`Are you sure you want to set order ${orderCode} status to ${newStatus}?`)) {
        return;
    }
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/orders/${orderCode}/status?status=${newStatus}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            alert(data.message || `Order ${orderCode} status updated to ${newStatus} successfully!`);
            await loadAllOrders();
        } else {
            alert(data.message || "Failed to update order status!");
        }
    } catch (err) {
        console.error("Error updating order status:", err);
    }

}

async function downloadInvoicePdf(orderCode) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/orders/${orderCode}/pdf`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `Invoice_${orderCode}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } else {
            alert("Failed to download invoice PDF. Please try again later.");
        }
    } catch (err) {
        console.error("Error downloading invoice PDF:", err);
    }
}

async function viewOrderDetails(orderCode) {
    const token = localStorage.getItem('token');
    try {

        const response = await fetch(`${BASE_URL}/orders/${orderCode}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (response.ok || data.code === 200) {
            const order = data.body || data.data;

            document.getElementById('viewModalOrderCode').innerText = order.orderCode || '-';
            document.getElementById('viewModalCustomerEmail').innerText = order.customerEmail || '-';
            document.getElementById('viewModalOrderDate').innerText = order.orderDate ? new Date(order.orderDate).toLocaleString() : '-';

            let priceFormatted = order.totalPrice ? order.totalPrice.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) : '0.00';
            document.getElementById('viewModalTotalPrice').innerText = `LKR ${priceFormatted}`;

            let badgeClass = 'bg-secondary';
            if (order.orderStatus === 'PENDING') badgeClass = 'badge-status-pending';
            else if (order.orderStatus === 'APPROVED') badgeClass = 'badge-status-approved';
            else if (order.orderStatus === 'DISPATCHED') badgeClass = 'badge-status-dispatched';
            else if (order.orderStatus === 'CANCELLED') badgeClass = 'bg-danger';

            document.getElementById('viewModalOrderStatus').innerHTML = `<span class="badge ${badgeClass} rounded-pill px-3 py-2">${order.orderStatus}</span>`;

            const tbody = document.getElementById('viewModalOrderItemsTable');
            tbody.innerHTML = '';

            const items = order.orderItems || [];
            if (items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted py-3">No products in this order.</td></tr>';
            } else {
                items.forEach(item => {
                    tbody.innerHTML += `
                        <tr>
                            <td class="fw-bold">${item.productCode}</td>
                            <td>${item.quantity} Units</td>
                        </tr>
                    `;
                });
            }

            document.getElementById('btnModalDownloadPdf').onclick = () => downloadInvoicePdf(order.orderCode);

            viewOrderModalBS.show();
        } else {
            alert(data.message || "Failed to load order details. Please try again later.");
        }

    } catch (err) {
        console.error("Error loading order details:", err);
    }
}

function filterOrders() {
    const statusFilter = document.getElementById('filterStatusSelect').value;
    const searchQuery = document.getElementById('searchOrderInput').value.toLowerCase().trim();

    const filtered = allOrdersList.filter(o => {
        const matchesStatus = (statusFilter === 'ALL') || (o.orderStatus === statusFilter);

        const matchesQuery = !searchQuery ||
            (o.orderCode && o.orderCode.toLowerCase().includes(searchQuery)) ||
            (o.customerEmail && o.customerEmail.toLowerCase().includes(searchQuery));

        return matchesStatus && matchesQuery;
    });

    renderAllOrders(filtered);
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
