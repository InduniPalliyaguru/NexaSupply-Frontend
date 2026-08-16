let createShipmentModalBS, updateStatusModalBS, driverModalBS;
let allShipmentsList = [];
let allDriversList = [];

document.addEventListener('DOMContentLoaded', () => {
    createShipmentModalBS = new bootstrap.Modal(document.getElementById('createShipmentModal'));
    updateStatusModalBS = new bootstrap.Modal(document.getElementById('updateStatusModal'));
    driverModalBS = new bootstrap.Modal(document.getElementById('driverModal'));

    loadShipments();
    loadDrivers();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}


// GET /api/v1/shipments
function loadShipments() {

}

// POST /api/v1/shipments
function openCreateShipmentModal() {
    document.getElementById('createShipmentForm').reset();
    createShipmentModalBS.show();
}

function handleCreateShipmentSubmit(e) {
    e.preventDefault();

    const dto = {
        orderCode: document.getElementById('shipmentOrderCode').value,
        driverCode: document.getElementById('shipmentDriverCode').value
    };


    alert('Shipment created successfully!');
    createShipmentModalBS.hide();
}

// PUT /api/v1/shipments/{trackingNumber}/status?status=
function openUpdateStatusModal(trackingNumber, currentStatus) {
    document.getElementById('updateTrackingNumberHidden').value = trackingNumber;
    document.getElementById('selectNewShipmentStatus').value = currentStatus;
    updateStatusModalBS.show();
}

function submitStatusUpdate() {
    const trackingNumber = document.getElementById('updateTrackingNumberHidden').value;
    const newStatus = document.getElementById('selectNewShipmentStatus').value;


    alert(`Shipment ${trackingNumber} status updated to ${newStatus}`);
    updateStatusModalBS.hide();
}

// DELETE /api/v1/shipments/{trackingNumber}
function deleteShipment(trackingNumber) {
    if (confirm(`Are you sure you want to delete shipment ${trackingNumber}?`)) {

        alert(`Shipment ${trackingNumber} deleted successfully!`);
    }
}

function filterShipments() {
    const statusFilter = document.getElementById('filterShipmentStatus').value;
    const searchQuery = document.getElementById('searchShipmentInput').value.toLowerCase().trim();

    const filtered = allShipmentsList.filter(shipment => {
        const matchesStatus = (statusFilter === 'ALL' || shipment.status === statusFilter);
        const matchesQuery = shipment.trackingNumber.toLowerCase().includes(searchQuery) ||
            shipment.orderCode.toLowerCase().includes(searchQuery) ||
            (shipment.driverName && shipment.driverName.toLowerCase().includes(searchQuery)) ||
            shipment.driverCode.toLowerCase().includes(searchQuery);

        return matchesStatus && matchesQuery;
    });

    renderShipmentsTable(filtered);
}

function renderShipmentsTable(shipments) {
    // Function to populate shipments tbody
}


// GET /api/v1/drivers
function loadDrivers() {

}

// POST /api/v1/drivers or PUT /api/v1/drivers/{driverCode}
function openAddDriverModal() {
    document.getElementById('driverModalTitle').innerText = "Add New Driver";
    document.getElementById('driverCodeHidden').value = "";
    document.getElementById('driverForm').reset();
    driverModalBS.show();
}

function openEditDriverModal(code, name, phone, license) {
    document.getElementById('driverModalTitle').innerText = "Edit Driver Details";
    document.getElementById('driverCodeHidden').value = code;
    document.getElementById('driverNameInput').value = name;
    document.getElementById('driverPhoneInput').value = phone;
    document.getElementById('driverLicenseInput').value = license;
    driverModalBS.show();
}

function handleDriverSubmit(e) {
    e.preventDefault();
    const code = document.getElementById('driverCodeHidden').value;

    const dto = {
        driverName: document.getElementById('driverNameInput').value,
        phone: document.getElementById('driverPhoneInput').value,
        licenseNo: document.getElementById('driverLicenseInput').value
    };

    if (code) {
        // PUT /api/v1/drivers/{driverCode}
        alert(`Driver ${code} updated successfully!`);
    } else {
        // POST /api/v1/drivers
        alert("Driver created successfully!");
    }
    driverModalBS.hide();
}

// PUT /api/v1/drivers/{driverCode}/status?status=
function toggleDriverStatus(driverCode, newStatus) {
    if (confirm(`Change status of driver ${driverCode} to ${newStatus}?`)) {

        alert(`Driver ${driverCode} status updated to ${newStatus}`);
    }
}

// DELETE /api/v1/drivers/{driverCode}
function deleteDriver(driverCode) {
    if (confirm(`Are you sure you want to delete driver ${driverCode}?`)) {

        alert(`Driver ${driverCode} deleted successfully!`);
    }
}

// DRIVER FILTERING (SEARCH BY DRIVER CODE, NAME, OR PHONE)
function filterDrivers() {
    const statusFilter = document.getElementById('filterDriverStatus').value;
    const searchQuery = document.getElementById('searchDriverInput').value.toLowerCase().trim();

    const filteredDrivers = allDriversList.filter(driver => {
        const matchesStatus = (statusFilter === 'ALL' || driver.status === statusFilter);
        const matchesQuery = driver.driverCode.toLowerCase().includes(searchQuery) ||
            driver.driverName.toLowerCase().includes(searchQuery) ||
            driver.phone.includes(searchQuery);

        return matchesStatus && matchesQuery;
    });

    renderDriversTable(filteredDrivers);
}

function renderDriversTable(drivers) {
    // Function to populate drivers tbody
}