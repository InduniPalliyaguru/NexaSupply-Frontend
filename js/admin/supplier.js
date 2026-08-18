let supplierModalBS, restockModalBS, viewRestockModalBS;
let allSuppliersList = [];
let allRestockList = [];
let allProductsList = [];

document.addEventListener('DOMContentLoaded', () => {
    supplierModalBS = new bootstrap.Modal(document.getElementById('supplierModal'));
    restockModalBS = new bootstrap.Modal(document.getElementById('restockModal'));
    viewRestockModalBS = new bootstrap.Modal(document.getElementById('viewRestockModal'));

    loadSuppliers();
    loadRestockHistory();
    loadProducts();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

async function loadProducts() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/products`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok || data.code === 200 || data.status === 200) {
            allProductsList = data.body || data.data || [];
        }
    } catch (err) {
        console.error("Error loading products:", err);
    }
}

async function loadSuppliers() {
    const token = localStorage.getItem('token');
    try {

        const response = await fetch(`${BASE_URL}/suppliers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok || data.code === 200 || data.status === 200) {
            allSuppliersList = data.body || data.data || [];
            renderSupplierTable(allSuppliersList);
            populateSupplierDropdown(allSuppliersList);
        }
    } catch (err) {
        console.error("Error loading suppliers:", err);
    }
}

function renderSupplierTable(suppliers) {
    const tbody = document.getElementById('suppliersTableBody');
    tbody.innerHTML = '';

    if (!suppliers || suppliers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No suppliers found</td></tr>`;
        return;
    }

    suppliers.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td class="fw-bold" style="color: var(--nexa-primary);">${s.supplierCode}</td>
                <td class="fw-bold text-dark">${s.companyName}</td>
                <td>${s.contactPerson || '-'}</td>
                <td>${s.phone || '-'}</td>
                <td>${s.email || '-'}</td>
                <td>${s.address || '-'}</td>
                <td class="text-end">
                    <button class="btn btn-light btn-sm rounded-circle me-1"
                        onclick="openEditSupplierModal('${s.supplierCode}', '${escapeQuotes(s.companyName)}', '${escapeQuotes(s.contactPerson)}', '${s.phone || ''}', '${s.email || ''}', '${escapeQuotes(s.address)}')">
                        <i class="fa-solid fa-pen-to-square text-primary"></i>
                    </button>
                    <button class="btn btn-light btn-sm rounded-circle" onclick="deleteSupplier('${s.supplierCode}')">
                        <i class="fa-solid fa-trash text-danger"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function populateSupplierDropdown(suppliers) {
    const select = document.getElementById('restockSupplierCode');
    if (!select) return;

    select.innerHTML = `<option value="" disabled selected>Select Supplier</option>`;
    suppliers.forEach(s => {
        select.innerHTML += `<option value="${s.supplierCode}">${s.companyName} (${s.supplierCode})</option>`;
    });
}

function escapeQuotes(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

async function handleSupplierSearch(query) {
    const trimmed = query.trim();
    if (!trimmed) {
        renderSupplierTable(allSuppliersList);
        return;
    }
    const token = localStorage.getItem('token');
    try {

        const response = await fetch(`${BASE_URL}/suppliers/search?query=${encodeURIComponent(trimmed)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (response.ok || data.code === 200) {
            renderSupplierTable(data.body || data.data || []);
        }

    } catch (err) {
        console.error("Error searching suppliers:", err);
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

async function handleSupplierSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const code = document.getElementById('supplierCodeHidden').value;

    const dto = {
        supplierCode: code || null,
        companyName: document.getElementById('supplierCompanyName').value,
        contactPerson: document.getElementById('supplierContactPerson').value,
        phone: document.getElementById('supplierPhone').value,
        email: document.getElementById('supplierEmail').value,
        address: document.getElementById('supplierAddress').value
    };
    const isEdit = !!code;
    const method = isEdit ? 'PUT' : 'POST';

    try {

        const response = await fetch(`${BASE_URL}/suppliers`, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dto)
        });

        const data = await response.json();

        if (response.ok || data.code === 200 || data.code === 201) {
            alert(isEdit ? "Supplier updated successfully!" : "Supplier created successfully!");
            supplierModalBS.hide();
            await loadSuppliers();
        } else {
            alert(data.message || "Failed to save supplier!");
        }

    } catch (err) {
        console.error("Error saving supplier:", err);
    }

}

async function deleteSupplier(supplierCode) {
    if (!confirm(`Are you sure you want to delete supplier ${supplierCode}?`)) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/suppliers/${supplierCode}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            alert(data.message || "Supplier deleted successfully!");
            await loadSuppliers();
        } else {
            alert(data.message || "Failed to delete supplier!");
        }
    } catch (err) {
        console.error("Error deleting supplier:", err);
    }
}


async function loadRestockHistory() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/restocks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200 || data.status === 200) {
            allRestockList = data.body || data.data || [];
            renderRestockTable(allRestockList);
        }
    } catch (err) {
        console.error("Error loading restock history:", err);
    }
}

function renderRestockTable(restockList) {
    const tbody = document.getElementById('restockTableBody');
    tbody.innerHTML = '';

    if (!restockList || restockList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No restock history entries found</td></tr>`;
        return;
    }

    restockList.forEach(r => {
        let formattedDate = r.restockDate ? new Date(r.restockDate).toLocaleString() : '-';
        let costFormatted = r.totalCost ? r.totalCost.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) : '0.00';

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold" style="color: var(--nexa-primary);">${r.restockCode}</td>
                <td class="fw-bold text-dark">${r.supplierName || '-'}</td>
                <td>${r.invoiceNumber || '-'}</td>
                <td class="text-muted small">${formattedDate}</td>
                <td class="fw-bold text-success">LKR ${costFormatted}</td>
                <td class="text-end">
                    <button class="btn btn-light btn-sm rounded-circle" title="View Details"
                            onclick="viewRestockDetails('${r.restockCode}')">
                        <i class="fa-solid fa-eye text-secondary"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

async function handleRestockSearch(query) {
    const trimmed = query.trim();

    if (!trimmed) {
        renderRestockTable(allRestockList);
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/restocks/${encodeURIComponent(trimmed)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            const result = data.body || data.data;
            renderRestockTable(result ? [result] : []);
        } else {
            const filtered = allRestockList.filter(r =>
                (r.restockCode && r.restockCode.toLowerCase().includes(trimmed.toLowerCase())) ||
                (r.invoiceNumber && r.invoiceNumber.toLowerCase().includes(trimmed.toLowerCase()))
            );
            renderRestockTable(filtered);
        }
    } catch (err) {
        console.error("Error searching restock code:", err);
    }
}

async function openAddRestockModal() {
    document.getElementById('restockForm').reset();
    document.getElementById('restockItemsContainer').innerHTML = "";

    await loadSuppliers();

    if (allProductsList.length === 0) {
        await loadProducts();
    }

    addRestockRow();
    calculateGrandTotal();
    restockModalBS.show();
}

function addRestockRow() {
    const container = document.getElementById('restockItemsContainer');
    const rowId = Date.now();

    let productOptions = `<option value="" disabled selected>Select Product</option>`;
    if (allProductsList && allProductsList.length > 0) {
        allProductsList.forEach(p => {
            const pCode = p.productCode || p.code;
            const pName = p.productName || p.name || '';
            productOptions += `<option value="${pCode}">${pCode} - ${pName}</option>`;
        });
    }

    const tr = document.createElement('tr');
    tr.id = `row-${rowId}`;
    tr.innerHTML = `
        <td>
            <select class="form-select rounded-pill item-code" required>
                ${productOptions}
            </select>
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

    document.getElementById('restockGrandTotalDisplay').innerText = `LKR ${grandTotal.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

async function handleRestockSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const supplierCode = document.getElementById('restockSupplierCode').value;
    const invoiceNumber = document.getElementById('restockInvoiceNumber').value;

    const rows = document.querySelectorAll('#restockItemsContainer tr');
    const items = [];

    rows.forEach(row => {
        const productCode = row.querySelector('.item-code').value.trim();
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

    try {
        const response = await fetch(`${BASE_URL}/restocks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(restockRequestDTO)
        });

        const data = await response.json();

        if (response.ok || data.code === 201 || data.code === 200) {
            alert(data.message || "Restock entry created successfully!");
            restockModalBS.hide();
            await loadRestockHistory();
        } else {
            alert(data.message || "Failed to create restock entry!");
        }
    } catch (err) {
        console.error("Error creating restock entry:", err);
    }
}

async function viewRestockDetails(restockCode) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${BASE_URL}/restocks/${restockCode}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            const restock = data.body || data.data;

            document.getElementById('viewRestockCode').innerText = restock.restockCode || '-';
            document.getElementById('viewSupplierName').innerText = restock.supplierName || '-';
            document.getElementById('viewInvoiceNo').innerText = restock.invoiceNumber || '-';
            document.getElementById('viewRestockDate').innerText = restock.restockDate ? new Date(restock.restockDate).toLocaleString() : '-';

            const tbody = document.getElementById('viewRestockItemsTable');
            tbody.innerHTML = '';

            const detailsList = restock.details || [];
            let grandTotal = 0;

            if (detailsList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No items found</td></tr>`;
            } else {
                detailsList.forEach(item => {
                    const subTotal = item.subTotal || (item.qtyAdded * item.purchaseUnitPrice);
                    grandTotal += subTotal;

                    tbody.innerHTML += `
                        <tr>
                            <td class="fw-bold">${item.productCode}</td>
                            <td>${item.productName || '-'}</td>
                            <td>${item.qtyAdded}</td>
                            <td>LKR ${item.purchaseUnitPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                            <td class="text-end fw-bold">LKR ${subTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        </tr>
                    `;
                });
            }

            const totalToShow = restock.totalCost ? restock.totalCost : grandTotal;
            document.getElementById('viewRestockGrandTotal').innerText = `LKR ${totalToShow.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

            viewRestockModalBS.show();
        } else {
            alert(data.message || "Failed to fetch restock details!");
        }
    } catch (err) {
        console.error("Error fetching restock details:", err);
    }
}