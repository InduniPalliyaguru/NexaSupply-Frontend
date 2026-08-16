let viewOrderModalBS;
let allOrdersList = [];

document.addEventListener('DOMContentLoaded', () => {
    viewOrderModalBS = new bootstrap.Modal(document.getElementById('viewOrderModal'));
    loadAllOrders();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

// ================= 1. FETCH ALL ORDERS (GET /api/v1/orders) =================
function loadAllOrders() {

}

function renderPendingOrders(pendingOrders) {
    const tbody = document.getElementById('pendingOrdersTableBody');
    document.getElementById('pendingBadgeCount').innerText = pendingOrders.length;

    if (pendingOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No pending orders waiting for approval.</td></tr>';
        return;
    }

    // Logic to build table rows for PENDING items
}

function renderAllOrders(orders) {
    // Logic to build table rows for ALL master orders
}

function updateOrderStatus(orderCode, newStatus) {
    if (!['APPROVED', 'CANCELLED'].includes(newStatus)) {
        alert('Admin can only set status to APPROVED or CANCELLED manually.');
        return;
    }

    if (confirm(`Are you sure you want to set order ${orderCode} status to ${newStatus}?`)) {

        alert(`Order ${orderCode} status updated to ${newStatus} successfully!`);
    }
}

function downloadInvoicePdf(orderCode) {
    // Triggers direct browser download of generated PDF
    const pdfUrl = `/api/v1/orders/${orderCode}/pdf`;
    window.open(pdfUrl, '_blank');
}

function viewOrderDetails(orderCode) {


    // Sample UI Population Simulation based on OrderResponseDTO & OrderProductDTO
    document.getElementById('viewModalOrderCode').innerText = orderCode;
    document.getElementById('viewModalCustomerEmail').innerText = "retailer@citysuper.com";
    document.getElementById('viewModalOrderDate').innerText = "16 Aug 2026, 10:30 AM";
    document.getElementById('viewModalTotalPrice').innerText = "LKR 450,000.00";
    document.getElementById('viewModalOrderStatus').innerHTML = '<span class="badge badge-status-pending rounded-pill px-3 py-2">PENDING</span>';

    const tbody = document.getElementById('viewModalOrderItemsTable');
    tbody.innerHTML = `
            <tr>
                <td class="fw-bold">PRD-1001</td>
                <td>1500 Units</td>
            </tr>
            <tr>
                <td class="fw-bold">PRD-1004</td>
                <td>500 Units</td>
            </tr>
        `;

    document.getElementById('btnModalDownloadPdf').onclick = () => downloadInvoicePdf(orderCode);

    viewOrderModalBS.show();
}

function filterOrders() {
    const statusFilter = document.getElementById('filterStatusSelect').value;
    const searchQuery = document.getElementById('searchOrderInput').value.toLowerCase().trim();

    // Performs frontend client-side filtering on allOrdersList array
}