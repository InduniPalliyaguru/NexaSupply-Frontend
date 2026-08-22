let myOrdersList = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchMyOrders();
    fetchUserProfileHeader();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

async function fetchMyOrders() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../index.html';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/orders/myOrders`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && (result.code === 200 || result.status === 200)) {
            myOrdersList = result.body || result.data || [];
            renderOrdersTable(myOrdersList);
        } else {
            console.error("Cannot load orders:", result.message);
            renderOrdersTable([]);
        }
    } catch (error) {
        console.error("Fetch My Orders Error:", error);
        renderOrdersTable([]);
    }
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    <i class="fa-solid fa-box-archive fs-2 mb-2 d-block"></i>
                    No purchase orders found.
                </td>
            </tr>`;
        return;
    }

    orders.forEach(ord => {
        const itemCount = ord.orderItems
            ? ord.orderItems.reduce((acc, i) => acc + (i.quantity || 0), 0)
            : 0;

        const formattedTotal = 'LKR ' + Number(ord.totalPrice || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
        const formattedDate = ord.orderDate ? new Date(ord.orderDate).toLocaleString() : 'N/A';

        tbody.innerHTML += `
            <tr>
                <td class="ps-4 fw-bold text-primary">${ord.orderCode}</td>
                <td class="text-muted small">${formattedDate}</td>
                <td><span class="badge bg-light text-dark border">${itemCount} Items</span></td>
                <td class="fw-bold">${formattedTotal}</td>
                <td>
                    <span class="status-badge status-${ord.orderStatus}">${ord.orderStatus}</span>
                </td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-info rounded-pill px-3 me-1"
                            onclick="fetchShipmentByOrderCode('${ord.orderCode}')" title="Track Shipment Details">
                        <i class="fa-solid fa-truck-fast me-1"></i> Track
                    </button>
                    <button class="btn btn-sm btn-light rounded-pill px-3 me-1" onclick="viewOrderDetails('${ord.orderCode}')">
                        <i class="fa-solid fa-eye text-secondary me-1"></i> Details
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="downloadPdf('${ord.orderCode}')">
                        <i class="fa-solid fa-file-pdf me-1"></i> PDF
                    </button>
                </td>
            </tr>
        `;
    });
}

function filterOrders() {
    const searchTerm = document.getElementById('txtSearchOrder').value.toLowerCase().trim();
    const selectedStatus = document.getElementById('cmbStatusFilter').value;

    const filtered = myOrdersList.filter(ord => {
        const matchesCode = ord.orderCode && ord.orderCode.toLowerCase().includes(searchTerm);
        const matchesStatus = (selectedStatus === 'ALL') || (ord.orderStatus === selectedStatus);
        return matchesCode && matchesStatus;
    });

    renderOrdersTable(filtered);
}

async function fetchShipmentByOrderCode(orderCode) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${BASE_URL}/shipments/order/${orderCode}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && (result.code === 200 || result.status === 200)) {
            const shipmentData = result.body || result.data;
            if (shipmentData) {
                populateShipmentModal(shipmentData);
            } else {
                alert("No shipment details available for this order yet.");
            }
        } else {
            alert(result.message || "No shipment details found for this order yet.");
        }
    } catch (error) {
        console.error("Shipment Fetch Error:", error);
        alert("Failed to fetch shipment details.");
    }
}

function populateShipmentModal(shipment) {
    document.getElementById('lblShipmentTracking').innerText = shipment.trackingNumber || 'N/A';

    const statusBadge = document.getElementById('lblShipmentStatus');
    if (statusBadge) {
        statusBadge.innerText = shipment.status || 'PENDING';
        statusBadge.className = `status-badge status-${shipment.status}`;
    }

    document.getElementById('lblShipmentDispatchedDate').innerText = shipment.dispatchedDate
        ? new Date(shipment.dispatchedDate).toLocaleString()
        : 'Not Dispatched Yet';

    document.getElementById('lblShipmentDriverName').innerText = shipment.driverName || 'Unassigned Driver';
    document.getElementById('lblShipmentDriverCode').innerText = 'Driver Code: ' + (shipment.driverCode || 'N/A');
    document.getElementById('lblShipmentOrderCode').innerText = '#' + (shipment.orderCode || 'N/A');

    const modal = new bootstrap.Modal(document.getElementById('shipmentDetailsModal'));
    modal.show();
}


function viewOrderDetails(orderCode) {
    const order = myOrdersList.find(o => o.orderCode === orderCode);
    if (order) {
        populateModalUI(order);
    } else {
        fetchOrderByCode(orderCode);
    }
}

async function fetchOrderByCode(orderCode) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/orders/${orderCode}`, {
            method: 'GET',
            headers: {'Authorization': `Bearer ${token}`}
        });
        const result = await response.json();
        if (response.ok && (result.code === 200 || result.status === 200)) {
            populateModalUI(result.body || result.data);
        }
    } catch (err) {
        console.error("Get Order By Code Error:", err);
    }
}

function populateModalUI(order) {
    document.getElementById('lblModalOrderCode').innerText = '#' + order.orderCode;
    document.getElementById('lblModalOrderDate').innerText = 'Date: ' + (order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A');

    const statusBadge = document.getElementById('lblModalStatus');
    if (statusBadge) {
        statusBadge.innerText = order.orderStatus;
        statusBadge.className = `status-badge status-${order.orderStatus}`;
    }

    const itemsBody = document.getElementById('modalOrderItemsBody');
    if (itemsBody) {
        itemsBody.innerHTML = '';

        if (order.orderItems && order.orderItems.length > 0) {
            order.orderItems.forEach(item => {
                itemsBody.innerHTML += `
                    <tr>
                        <td class="fw-semibold text-dark">${item.productCode}</td>
                        <td class="text-center fw-bold text-primary">${item.quantity}</td>
                    </tr>
                `;
            });
        } else {
            itemsBody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">No items found</td></tr>`;
        }
    }

    const formattedTotal = 'LKR ' + Number(order.totalPrice || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('lblModalTotalAmount').innerText = formattedTotal;

    const downloadBtn = document.getElementById('btnModalDownloadPdf');
    if (downloadBtn) {
        downloadBtn.onclick = () => downloadPdf(order.orderCode);
    }

    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

async function downloadPdf(orderCode) {
    const token = localStorage.getItem('token');
    if (!token) return;

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
            alert("Failed to download PDF invoice.");
        }
    } catch (error) {
        console.error("PDF Download Error:", error);
    }
}

async function fetchUserProfileHeader() {
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
                const nameElem = document.getElementById('headerName');
                if (nameElem) nameElem.innerText = user.fullName;

                const mailElem = document.getElementById('profileEmail');
                if (mailElem) mailElem.innerText = user.email || '';


                const avatarElem = document.getElementById('headerAvatar');
                if (avatarElem) avatarElem.innerText = user.fullName.charAt(0).toUpperCase();
            }
        }
    } catch (err) {
        console.error("Cannot load profile:", err);
    }
}