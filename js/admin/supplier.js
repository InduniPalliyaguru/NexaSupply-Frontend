let supplierModalBS, restockModalBS, viewRestockModalBS;

document.addEventListener('DOMContentLoaded', () => {
    supplierModalBS = new bootstrap.Modal(document.getElementById('supplierModal'));
    restockModalBS = new bootstrap.Modal(document.getElementById('restockModal'));
    viewRestockModalBS = new bootstrap.Modal(document.getElementById('viewRestockModal'));

    loadSuppliers();
    loadRestockHistory();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}


function loadSuppliers() {

}

function handleSupplierSearch(query) {
    if (!query.trim()) {
        loadSuppliers();
        return;
    }

}

function openAddSupplierModal() {
    document.getElementById('supplierModalTitle').innerText = "Add New Supplier";
    document.getElementById('supplierCodeHidden').value = "";
    document.getElementById('supplierForm').reset();
    supplierModalBS.show();
}

function openEditSupplierModal(code, company, contact, phone, email, address) {
    document.getElementById('supplierModalTitle').innerText = "Edit Supplier Details";
    document.getElementById('supplierCodeHidden').value = code;
    document.getElementById('supplierCompanyName').value = company;
    document.getElementById('supplierContactPerson').value = contact || "";
    document.getElementById('supplierPhone').value = phone || "";
    document.getElementById('supplierEmail').value = email || "";
    document.getElementById('supplierAddress').value = address || "";
    supplierModalBS.show();
}

function handleSupplierSubmit(e) {
    e.preventDefault();
    const code = document.getElementById('supplierCodeHidden').value;

    const dto = {
        companyName: document.getElementById('supplierCompanyName').value,
        contactPerson: document.getElementById('supplierContactPerson').value,
        phone: document.getElementById('supplierPhone').value,
        email: document.getElementById('supplierEmail').value,
        address: document.getElementById('supplierAddress').value
    };

    if (code) {
        dto.supplierCode = code;
        alert("Supplier updated successfully!");
    } else {
        alert("Supplier added successfully!");
    }
    supplierModalBS.hide();
}

function deleteSupplier(supplierCode) {
    if (confirm(`Are you sure you want to delete supplier ${supplierCode}?`)) {
        alert(`Supplier ${supplierCode} deleted successfully!`);
    }
}


// GET /api/v1/restocks (Fetch All History)
function loadRestockHistory() {

}

// GET /api/v1/restocks/{restockCode} (Search by Restock Code)
function handleRestockSearch(restockCode) {
    const query = restockCode.trim();
    if (!query) {
        loadRestockHistory();
        return;
    }

}

function openAddRestockModal() {
    document.getElementById('restockForm').reset();
    document.getElementById('restockItemsContainer').innerHTML = "";
    addRestockRow();
    calculateGrandTotal();
    restockModalBS.show();
}

function addRestockRow() {
    const container = document.getElementById('restockItemsContainer');
    const rowId = Date.now();

    const tr = document.createElement('tr');
    tr.id = `row-${rowId}`;
    tr.innerHTML = `
            <td>
                <input type="text" class="form-control rounded-pill item-code" placeholder="e.g. PRD-1001" required>
            </td>
            <td>
                <input type="number" class="form-control rounded-pill item-qty" value="1" min="1" oninput="calculateGrandTotal()" required>
            </td>
            <td>
                <input type="number" class="form-control rounded-pill item-price" value="0.00" min="0" step="0.01" oninput="calculateGrandTotal()" required>
            </td>
            <td class="text-center">
                <button type="button" class="btn btn-light btn-sm rounded-circle" onclick="removeRestockRow('row-${rowId}')">
                    <i class="fa-solid fa-trash text-danger"></i>
                </button>
            </td>
        `;
    container.appendChild(tr);
    calculateGrandTotal();
}

function removeRestockRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        calculateGrandTotal();
    }
}

function calculateGrandTotal() {
    const rows = document.querySelectorAll('#restockItemsContainer tr');
    let grandTotal = 0;

    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        grandTotal += (qty * price);
    });

    document.getElementById('restockGrandTotalDisplay').innerText = `LKR ${grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}

// POST /api/v1/restocks
function handleRestockSubmit(e) {
    e.preventDefault();

    const supplierCode = document.getElementById('restockSupplierCode').value;
    const invoiceNumber = document.getElementById('restockInvoiceNumber').value;

    const rows = document.querySelectorAll('#restockItemsContainer tr');
    const items = [];

    rows.forEach(row => {
        const productCode = row.querySelector('.item-code').value;
        const qtyAdded = parseInt(row.querySelector('.item-qty').value) || 0;
        const purchaseUnitPrice = parseFloat(row.querySelector('.item-price').value) || 0;

        if (productCode && qtyAdded > 0) {
            items.push({
                productCode: productCode,
                qtyAdded: qtyAdded,
                purchaseUnitPrice: purchaseUnitPrice
            });
        }
    });

    if (items.length === 0) {
        alert("Please add at least one valid restock item.");
        return;
    }

    const restockRequestDTO = {
        supplierCode: supplierCode,
        invoiceNumber: invoiceNumber,
        items: items
    };

    alert("Restock entry created successfully!");
    restockModalBS.hide();
}

// GET /api/v1/restocks/{restockCode} (View Detail Modal)
function viewRestockDetails(restockCode) {

    document.getElementById('viewRestockCode').innerText = restockCode;
    document.getElementById('viewSupplierName').innerText = "Ceylon Beverages PLC";
    document.getElementById('viewInvoiceNo').innerText = "INV-88902";
    document.getElementById('viewRestockDate').innerText = "16 Aug 2026, 02:15 PM";

    const tbody = document.getElementById('viewRestockItemsTable');
    tbody.innerHTML = `
            <tr>
                <td class="fw-bold">PRD-1001</td>
                <td>Coca Cola 1.5L</td>
                <td>2000</td>
                <td>LKR 250.00</td>
                <td class="text-end fw-bold">LKR 500,000.00</td>
            </tr>
            <tr>
                <td class="fw-bold">PRD-1002</td>
                <td>Sprite 1.5L</td>
                <td>3000</td>
                <td>LKR 250.00</td>
                <td class="text-end fw-bold">LKR 750,000.00</td>
            </tr>
        `;
    document.getElementById('viewRestockGrandTotal').innerText = "LKR 1,250,000.00";

    viewRestockModalBS.show();
}