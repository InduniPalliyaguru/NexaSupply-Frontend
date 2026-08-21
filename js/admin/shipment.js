let createShipmentModalBS, updateStatusModalBS, driverModalBS;
let allShipmentsList = [];
let allDriversList = [];

document.addEventListener('DOMContentLoaded', () => {
    createShipmentModalBS = new bootstrap.Modal(document.getElementById('createShipmentModal'));
    updateStatusModalBS = new bootstrap.Modal(document.getElementById('updateStatusModal'));
    driverModalBS = new bootstrap.Modal(document.getElementById('driverModal'));

    loadShipments();
    loadDrivers();
    fetchUserProfileName();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

function escapeQuotes(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

async function loadShipments() {
    const token = localStorage.getItem('token');
    try {

        const response = await fetch(`${BASE_URL}/shipments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            allShipmentsList = data.body || data.data || [];
            renderShipmentsTable(allShipmentsList);
        } else {
            console.error("Failed to load shipments:", data.message);
        }

    } catch (err) {
        console.error("Error loading shipments:", err);
    }

}

function renderShipmentsTable(shipments) {
    const tbody = document.getElementById('shipmentsTableBody');
    tbody.innerHTML = '';

    if (!shipments || shipments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No shipments found</td></tr>`;
        return;
    }

    shipments.forEach(s => {
        let formattedDate = s.dispatchedDate ? new Date(s.dispatchedDate).toLocaleString() : '-';

        let badgeClass = 'bg-secondary';
        if (s.status === 'PENDING') badgeClass = 'badge-ship-pending';
        else if (s.status === 'DISPATCHED') badgeClass = 'badge-ship-dispatched';
        else if (s.status === 'IN_TRANSIT') badgeClass = 'badge-ship-intransit';
        else if (s.status === 'DELIVERED') badgeClass = 'badge-ship-delivered';
        else if (s.status === 'CANCELLED') badgeClass = 'bg-danger';

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold" style="color: var(--nexa-primary);">${s.trackingNumber}</td>
                <td class="fw-bold text-dark">${s.orderCode || '-'}</td>
                <td>
                    <div><span class="fw-semibold">${s.driverName || '-'}</span></div>
                    <small class="text-muted">${s.driverCode || '-'}</small>
                </td>
                <td class="text-muted small">${formattedDate}</td>
                <td><span class="badge ${badgeClass} rounded-pill px-3 py-2">${s.status}</span></td>
                <td class="text-end">
                    <button class="btn btn-light btn-sm rounded-circle me-1"
                            onclick="openUpdateStatusModal('${s.trackingNumber}', '${s.status}')"
                            title="Update Status">
                        <i class="fa-solid fa-arrows-rotate text-primary"></i>
                    </button>
                    <button class="btn btn-light btn-sm rounded-circle"
                            onclick="deleteShipment('${s.trackingNumber}')" title="Delete Shipment">
                        <i class="fa-solid fa-trash text-danger"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

async function openCreateShipmentModal() {
    document.getElementById('createShipmentForm').reset();

    await loadDrivers();
    populateDriverDropdown(allDriversList);

    createShipmentModalBS.show();
}

function populateDriverDropdown(drivers) {
    const select = document.getElementById('shipmentDriverCode');
    if (!select) return;

    select.innerHTML = `<option value="" disabled selected>Select Available Driver</option>`;

    const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE');

    if (availableDrivers.length === 0) {
        select.innerHTML += `<option value="" disabled>No Available Drivers</option>`;
    } else {
        availableDrivers.forEach(d => {
            select.innerHTML += `<option value="${d.driverCode}">${d.driverName} (${d.driverCode})</option>`;
        });
    }
}

async function handleCreateShipmentSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const dto = {
        orderCode: document.getElementById('shipmentOrderCode').value.trim(),
        driverCode: document.getElementById('shipmentDriverCode').value
    };

    try {
        const response = await fetch(`${BASE_URL}/shipments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dto)
        });

        const data = await response.json();

        if (response.ok || data.code === 201) {
            alert(data.message || 'Shipment created successfully!');
            createShipmentModalBS.hide();
            await loadShipments();
            await loadDrivers();
        } else {
            alert(data.message || 'Failed to create shipment!');
        }
    } catch (err) {
        console.error("Error creating shipment:", err);
    }
}

function openUpdateStatusModal(trackingNumber, currentStatus) {
    document.getElementById('updateTrackingNumberHidden').value = trackingNumber;
    document.getElementById('selectNewShipmentStatus').value = currentStatus;
    updateStatusModalBS.show();
}

async function submitStatusUpdate() {
    const trackingNumber = document.getElementById('updateTrackingNumberHidden').value;
    const newStatus = document.getElementById('selectNewShipmentStatus').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/shipments/${trackingNumber}/status?status=${newStatus}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            alert(data.message || `Shipment ${trackingNumber} status updated to ${newStatus}`);
            updateStatusModalBS.hide();
            await loadShipments();
            await loadDrivers();
        } else {
            alert(data.message || "Failed to update status!");
        }
    } catch (err) {
        console.error("Error updating shipment status:", err);
    }
}

async function deleteShipment(trackingNumber) {
    if (!confirm(`Are you sure you want to delete shipment ${trackingNumber}?`)) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/shipments/${trackingNumber}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            alert(data.message || `Shipment ${trackingNumber} deleted successfully!`);
            await loadShipments();
        } else {
            alert(data.message || "Failed to delete shipment!");
        }
    } catch (err) {
        console.error("Error deleting shipment:", err);
    }
}

function filterShipments() {
    const statusFilter = document.getElementById('filterShipmentStatus').value;
    const searchQuery = document.getElementById('searchShipmentInput').value.toLowerCase().trim();

    const filtered = allShipmentsList.filter(shipment => {
        const matchesStatus = (statusFilter === 'ALL' || shipment.status === statusFilter);

        const matchesQuery = !searchQuery ||
            (shipment.trackingNumber && shipment.trackingNumber.toLowerCase().includes(searchQuery)) ||
            (shipment.orderCode && shipment.orderCode.toLowerCase().includes(searchQuery)) ||
            (shipment.driverName && shipment.driverName.toLowerCase().includes(searchQuery)) ||
            (shipment.driverCode && shipment.driverCode.toLowerCase().includes(searchQuery));

        return matchesStatus && matchesQuery;
    });

    renderShipmentsTable(filtered);
}


async function loadDrivers() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/drivers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            allDriversList = data.body || data.data || [];
            renderDriversTable(allDriversList);
        } else {
            console.error("Failed to load drivers:", data.message);
        }
    } catch (err) {
        console.error("Error loading drivers:", err);
    }
}

function renderDriversTable(drivers) {
    const tbody = document.getElementById('driversTableBody');
    tbody.innerHTML = '';

    if (!drivers || drivers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No drivers found</td></tr>`;
        return;
    }

    drivers.forEach(d => {
        let isAvailable = d.status === 'AVAILABLE';
        let badgeClass = isAvailable ? 'badge-driver-available' : 'badge-driver-ontrip';

        let toggleIcon = isAvailable ? 'fa-toggle-on text-success' : 'fa-toggle-off text-secondary';
        let targetStatus = isAvailable ? 'ON_TRIP' : 'AVAILABLE';
        let toggleTitle = isAvailable ? 'Set On Trip' : 'Set Available';

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold" style="color: var(--nexa-primary);">${d.driverCode}</td>
                <td class="fw-bold text-dark">${d.driverName}</td>
                <td>${d.phone || '-'}</td>
                <td>${d.licenseNo || '-'}</td>
                <td><span class="badge ${badgeClass} rounded-pill px-3 py-2">${d.status}</span></td>
                <td class="text-end">
                    <button class="btn btn-light btn-sm rounded-circle me-1"
                            onclick="openEditDriverModal('${d.driverCode}', '${escapeQuotes(d.driverName)}', '${d.phone}', '${escapeQuotes(d.licenseNo)}')"
                            title="Edit Driver">
                        <i class="fa-solid fa-pen-to-square text-primary"></i>
                    </button>
                    <button class="btn btn-light btn-sm rounded-circle me-1"
                            onclick="toggleDriverStatus('${d.driverCode}', '${targetStatus}')" title="${toggleTitle}">
                        <i class="fa-solid ${toggleIcon}"></i>
                    </button>
                    <button class="btn btn-light btn-sm rounded-circle" onclick="deleteDriver('${d.driverCode}')"
                            title="Delete Driver">
                        <i class="fa-solid fa-trash text-danger"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

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

async function handleDriverSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const code = document.getElementById('driverCodeHidden').value;

    const dto = {
        driverName: document.getElementById('driverNameInput').value.trim(),
        phone: document.getElementById('driverPhoneInput').value.trim(),
        licenseNo: document.getElementById('driverLicenseInput').value.trim()
    };

    const isEdit = !!code;
    const url = isEdit ? `${BASE_URL}/drivers/${code}` : `${BASE_URL}/drivers`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dto)
        });

        const data = await response.json();

        if (response.ok || data.code === 200 || data.code === 201) {
            alert(isEdit ? `Driver ${code} updated successfully!` : "Driver created successfully!");
            driverModalBS.hide();
            await loadDrivers();
        } else {
            alert(data.message || "Failed to save driver!");
        }
    } catch (err) {
        console.error("Error saving driver:", err);
    }
}

async function toggleDriverStatus(driverCode, newStatus) {
    if (!confirm(`Change status of driver ${driverCode} to ${newStatus}?`)) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/drivers/${driverCode}/status?status=${newStatus}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            alert(data.message || `Driver ${driverCode} status updated to ${newStatus}`);
            await loadDrivers();
        } else {
            alert(data.message || "Failed to update driver status!");
        }
    } catch (err) {
        console.error("Error updating driver status:", err);
    }
}

async function deleteDriver(driverCode) {
    if (!confirm(`Are you sure you want to delete driver ${driverCode}?`)) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/drivers/${driverCode}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            alert(data.message || `Driver ${driverCode} deleted successfully!`);
            await loadDrivers();
        } else {
            alert(data.message || "Failed to delete driver!");
        }
    } catch (err) {
        console.error("Error deleting driver:", err);
    }
}

function filterDrivers() {
    const statusFilter = document.getElementById('filterDriverStatus').value;
    const searchQuery = document.getElementById('searchDriverInput').value.toLowerCase().trim();

    const filteredDrivers = allDriversList.filter(driver => {
        const matchesStatus = (statusFilter === 'ALL' || driver.status === statusFilter);

        const matchesQuery = !searchQuery ||
            (driver.driverCode && driver.driverCode.toLowerCase().includes(searchQuery)) ||
            (driver.driverName && driver.driverName.toLowerCase().includes(searchQuery)) ||
            (driver.phone && driver.phone.includes(searchQuery));

        return matchesStatus && matchesQuery;
    });

    renderDriversTable(filteredDrivers);
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

