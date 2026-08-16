let myOrdersList = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchMyOrders();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

// 1. GET /api/v1/orders/myOrders
function fetchMyOrders() {
    fetch('/api/v1/orders/myOrders', {
        headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
    })
        .then(res => res.json())
        .then(response => {
            if (response.code === 200 && response.data) {
                myOrdersList = response.data;
                renderOrdersTable(myOrdersList);
            }
        })
        .catch(err => {
            // Dummy Data Preview
            myOrdersList = [
                {
                    orderCode: "ORD-94021",
                    orderDate: "2026-08-16T14:30:00",
                    totalPrice: 48500.00,
                    orderStatus: "DISPATCHED",
                    customerEmail: "retailer@nexasupply.com",
                    orderItems: [
                        {productCode: "PRD-101", quantity: 20},
                        {productCode: "PRD-102", quantity: 15}
                    ]
                },
                {
                    orderCode: "ORD-93905",
                    orderDate: "2026-08-10T09:15:00",
                    totalPrice: 125000.00,
                    orderStatus: "DELIVERED",
                    customerEmail: "retailer@nexasupply.com",
                    orderItems: [
                        {productCode: "PRD-301", quantity: 100}
                    ]
                },
                {
                    orderCode: "ORD-94110",
                    orderDate: "2026-08-17T10:00:00",
                    totalPrice: 18400.00,
                    orderStatus: "PENDING",
                    customerEmail: "retailer@nexasupply.com",
                    orderItems: [
                        {productCode: "PRD-201", quantity: 50}
                    ]
                }
            ];
            renderOrdersTable(myOrdersList);
        });
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    if (orders.length === 0) {
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
        const itemCount = ord.orderItems ? ord.orderItems.reduce((acc, i) => acc + i.quantity, 0) : 0;
        const formattedTotal = 'LKR ' + (ord.totalPrice || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
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
        const matchesCode = ord.orderCode.toLowerCase().includes(searchTerm);
        const matchesStatus = (selectedStatus === 'ALL') || (ord.orderStatus === selectedStatus);
        return matchesCode && matchesStatus;
    });

    renderOrdersTable(filtered);
}

// 2. GET /api/v1/shipments/order/{orderCode} or GET /api/v1/shipments/{trackingNumber}
function fetchShipmentByOrderCode(orderCode) {
    fetch(`/api/v1/shipments/order/${orderCode}`, {
        headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
    })
        .then(res => res.json())
        .then(response => {
            if (response.code === 200 && response.data) {
                populateShipmentModal(response.data);
            } else {
                alert(response.message || "No shipment details found for this order yet.");
            }
        })
        .catch(err => {
            // Dummy Data Preview (Matching ShipmentResponseDTO)
            const dummyShipment = {
                trackingNumber: "TRK-" + orderCode.replace('ORD-', ''),
                status: "DISPATCHED",
                dispatchedDate: "2026-08-16T16:45:00",
                orderCode: orderCode,
                driverCode: "DRV-102",
                driverName: "Saman Kumara"
            };
            populateShipmentModal(dummyShipment);
        });
}

function populateShipmentModal(shipment) {
    document.getElementById('lblShipmentTracking').innerText = shipment.trackingNumber || 'N/A';

    const statusBadge = document.getElementById('lblShipmentStatus');
    statusBadge.innerText = shipment.status || 'PENDING';
    statusBadge.className = `status-badge status-${shipment.status}`;

    document.getElementById('lblShipmentDispatchedDate').innerText = shipment.dispatchedDate ? new Date(shipment.dispatchedDate).toLocaleString() : 'Not Dispatched Yet';
    document.getElementById('lblShipmentDriverName').innerText = shipment.driverName || 'Unassigned Driver';
    document.getElementById('lblShipmentDriverCode').innerText = 'Driver Code: ' + (shipment.driverCode || 'N/A');
    document.getElementById('lblShipmentOrderCode').innerText = '#' + (shipment.orderCode || 'N/A');

    const modal = new bootstrap.Modal(document.getElementById('shipmentDetailsModal'));
    modal.show();
}

// 3. Order Details Handler
function viewOrderDetails(orderCode) {
    const order = myOrdersList.find(o => o.orderCode === orderCode);
    if (order) {
        populateModalUI(order);
    }
}

function populateModalUI(order) {
    document.getElementById('lblModalOrderCode').innerText = '#' + order.orderCode;
    document.getElementById('lblModalOrderDate').innerText = 'Date: ' + (order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A');

    const statusBadge = document.getElementById('lblModalStatus');
    statusBadge.innerText = order.orderStatus;
    statusBadge.className = `status-badge status-${order.orderStatus}`;

    const itemsBody = document.getElementById('modalOrderItemsBody');
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
    }

    const formattedTotal = 'LKR ' + (order.totalPrice || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('lblModalTotalAmount').innerText = formattedTotal;
    document.getElementById('btnModalDownloadPdf').onclick = () => downloadPdf(order.orderCode);

    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

// 4. Download PDF
function downloadPdf(orderCode) {
    window.open(`/api/v1/orders/${orderCode}/pdf`, '_blank');
}