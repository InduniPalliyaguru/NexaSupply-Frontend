let productModalBS;
let manageCategoriesModalBS;
let addCategoryModalBS;

let allProductsList = [];

document.addEventListener('DOMContentLoaded', () => {
    productModalBS = new bootstrap.Modal(document.getElementById('productModal'));
    manageCategoriesModalBS = new bootstrap.Modal(document.getElementById('manageCategoriesModal'));
    addCategoryModalBS = new bootstrap.Modal(document.getElementById('addCategoryModal'));

    loadCategories();
    loadProducts();
});

// Mobile Sidebar Drawer Toggle Logic
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

// Category Controller Integration
async function loadCategories() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/categories`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (data.code === 200 || data.status === 200) {
            const categories = data.body || [];

            const categorySelect = document.getElementById('categoryCode');
            categorySelect.innerHTML = `<option value="" selected disabled>Select Category</option>`;

            const categoryTableBody = document.getElementById('categoryTableBody');
            categoryTableBody.innerHTML = '';

            categories.forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat.categoryCode}">${cat.categoryCode} (${cat.categoryName})</option>`;

                categoryTableBody.innerHTML += `
                    <tr>
                        <td class="fw-bold" style="color: var(--nexa-primary);">${cat.categoryCode}</td>
                        <td class="fw-bold">${cat.categoryName}</td>
                        <td class="text-muted small">${cat.description || '-'}</td>
                        <td class="text-end">
                            <button class="btn btn-light btn-sm rounded-circle me-1" 
                                onclick="openEditCategoryModal('${cat.categoryCode}', '${cat.categoryName}', '${cat.description || ''}')">
                                <i class="fa-solid fa-pen-to-square" style="color: var(--nexa-primary);"></i>
                            </button>
                            <button class="btn btn-light btn-sm rounded-circle" onclick="deleteCategory('${cat.categoryCode}')">
                                <i class="fa-solid fa-trash text-danger"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            document.getElementById('kpiTotalCategories').innerText = categories.length;
        }

    } catch (err) {
        console.error("Error loading categories:", err);
    }
}

function openCategoriesManageModal() {
    loadCategories();
    manageCategoriesModalBS.show();
}

function openAddCategoryModal() {
    document.getElementById('addCategoryForm').reset();
    document.getElementById('categoryIsEdit').value = "false";
    document.getElementById('categoryModalTitle').innerText = "Add New Category";
    document.getElementById('btnSaveCategory').innerText = "Save Category";
    addCategoryModalBS.show();
}

function openEditCategoryModal(code, name, description) {
    document.getElementById('categoryIsEdit').value = "true";
    document.getElementById('categoryCodeHidden').value = code;
    document.getElementById('categoryName').value = name;
    document.getElementById('categoryDescription').value = description;

    document.getElementById('categoryModalTitle').innerText = `Edit Category (${code})`;
    document.getElementById('btnSaveCategory').innerText = "Update Category";
    addCategoryModalBS.show();
}

async function handleCategorySubmit(e) {
    const token = localStorage.getItem('token');
    e.preventDefault();

    const isEdit = document.getElementById('categoryIsEdit').value === "true";
    const code = document.getElementById('categoryCodeHidden').value;

    const categoryPayload = {
        categoryCode: isEdit ? code : null,
        categoryName: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };

    const url = `${BASE_URL}/categories`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryPayload)
        });

        const data = await response.json();

        if (response.ok || data.code === 200 || data.code === 201 || data.status === 200) {
            alert(isEdit ? "Category Updated!" : "Category Created!");
            addCategoryModalBS.hide();

            await loadCategories();
        } else {
            alert(data.message || "Failed to save category!");
        }
    } catch (err) {
        console.error("Error saving category:", err);
    }
}

async function deleteCategory(code) {
    const token = localStorage.getItem('token');
    if (!confirm(`Are you sure you want to delete category ${code}?`)) return;

    try {
        const response = await fetch(`${BASE_URL}/categories/${code}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        alert(data.message || "Category deleted successfully!");
        await loadCategories();
    } catch (err) {
        console.error("Error deleting category:", err);
    }
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

        if (data.code === 200 || data.status === 200) {
            allProductsList = data.body || [];
            renderProductTable(allProductsList);
            updateKPICards(allProductsList);
        }
    } catch (err) {
        console.error("Error loading products:", err);
    }
}

function renderProductTable(products) {
    const tableBody = document.getElementById('inventoryTable');
    tableBody.innerHTML = '';

    if (products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No products found</td></tr>`;
        return;
    }

    products.forEach(p => {
        let statusBadge = '';
        if (p.availableQty <= 0) {
            statusBadge = `<span class="pill-badge bg-danger text-white">OUT OF STOCK</span>`;
        } else if (p.availableQty <= p.minStockLevel) {
            statusBadge = `<span class="pill-badge bg-warning text-dark">LOW STOCK</span>`;
        } else {
            statusBadge = `<span class="pill-badge badge-approved">IN STOCK</span>`;
        }

        const imageSrc = p.imageUrl ? p.imageUrl : 'https://placehold.co/100x100?text=No+Img';

        tableBody.innerHTML += `
            <tr>
                <td>
                    <img src="${imageSrc}" class="product-img-thumb" alt="Product"
                         onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=No+Img';">
                </td>
                <td class="fw-bold" style="color: var(--nexa-primary);">${p.productCode}</td>
                <td>
                    <div class="fw-bold" style="color: var(--nexa-dark);">${p.productName}</div>
                    <div class="text-muted small">${p.categoryName || ''}</div>
                </td>
                <td><span class="badge bg-light text-dark fw-semibold">${p.categoryCode}</span></td>
                <td class="fw-bold">LKR ${p.unitPrice.toFixed(2)}</td>
                <td><span class="fw-bold">${p.availableQty} ${p.unit}</span></td>
                <td>${p.minStockLevel}</td>
                <td>${statusBadge}</td>
                <td class="text-end">
                    <button class="btn btn-light btn-sm rounded-circle me-1" title="Edit"
                            onclick="openEditModal('${p.productCode}')">
                        <i class="fa-solid fa-pen-to-square" style="color: var(--nexa-primary);"></i>
                    </button>
                    <button class="btn btn-light btn-sm rounded-circle" title="Delete"
                            onclick="deleteProduct('${p.productCode}')">
                        <i class="fa-solid fa-trash text-danger"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function updateKPICards(products) {
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.availableQty > 0 && p.availableQty <= p.minStockLevel).length;
    const outOfStockCount = products.filter(p => p.availableQty <= 0).length;

    document.getElementById('kpiTotalProducts').innerText = totalProducts;
    document.getElementById('kpiLowStock').innerText = lowStockCount;
    document.getElementById('kpiOutOfStock').innerText = outOfStockCount;
}

// Product Controller Integration
async function openAddModal() {
    document.getElementById('productForm').reset();
    document.getElementById('isEditMode').value = "false";
    document.getElementById('modalTitle').innerText = "Add New Product";
    document.getElementById('productCode').readOnly = true;
    document.getElementById('btnSaveProduct').innerText = "Save Product";

    await loadCategories();

    productModalBS.show();
}

async function openEditModal(code) {
    const token = localStorage.getItem('token');
    try {
        await loadCategories()
        const response = await fetch(`${BASE_URL}/products/${code}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if ((data.code === 200 || data.status === 200) && data.body) {
            const p = data.body;

            document.getElementById('isEditMode').value = "true";
            document.getElementById('modalTitle').innerText = `Edit Product (${p.productCode})`;
            document.getElementById('productCode').value = p.productCode;
            document.getElementById('productCode').readOnly = true;

            document.getElementById('name').value = p.productName;
            document.getElementById('unitPrice').value = p.unitPrice;
            document.getElementById('availableQty').value = p.availableQty;
            document.getElementById('unit').value = p.unit;
            document.getElementById('minStockLevel').value = p.minStockLevel;
            document.getElementById('imgUrl').value = p.imageUrl || '';
            document.getElementById('categoryCode').value = p.categoryCode;

            document.getElementById('btnSaveProduct').innerText = "Update Product";
            productModalBS.show();
        }
    } catch (err) {
        console.error("Error fetching product details:", err);
    }
}

async function handleProductSubmit(e) {
    const token = localStorage.getItem('token');
    e.preventDefault();

    const isEdit = document.getElementById('isEditMode').value === "true";

    const productPayload = {
        productCode: document.getElementById('productCode').value || null,
        name: document.getElementById('name').value,
        unitPrice: parseFloat(document.getElementById('unitPrice').value),
        availableQty: parseInt(document.getElementById('availableQty').value),
        unit: document.getElementById('unit').value,
        minStockLevel: parseInt(document.getElementById('minStockLevel').value || 0),
        imgUrl: document.getElementById('imgUrl').value || "",
        categoryCode: document.getElementById('categoryCode').value
    };

    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(`${BASE_URL}/products`, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productPayload)
        });

        const data = await response.json();

        if (response.ok || data.code === 200 || data.code === 201 || data.status === 200) {
            alert(isEdit ? "Product Updated Successfully!" : "Product Created Successfully!");
            productModalBS.hide();

            await loadProducts();

        } else {
            alert(data.message || "Something went wrong!");
        }
    } catch (err) {
        console.error("Error saving product:", err);
    }
}

async function deleteProduct(code) {
    const token = localStorage.getItem('token');
    if (!confirm(`Are you sure you want to delete product ${code}?`)) return;

    try {
        const response = await fetch(`${BASE_URL}/products/${code}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        alert(data.message || "Product deleted successfully!");
        await loadProducts();
    } catch (err) {
        console.error("Error deleting product:", err);
    }
}

function filterTable(filterType) {
    const title = document.getElementById('tableTitle');
    const subtitle = document.getElementById('tableSubTitle');

    if (filterType === 'LOW_STOCK') {
        title.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-danger me-2"></i>Low Stock Alerts';
        subtitle.innerText = "Showing items where available quantity is below minimum stock level";
        renderProductTable(allProductsList.filter(p => p.availableQty > 0 && p.availableQty <= p.minStockLevel));
    } else if (filterType === 'OUT_OF_STOCK') {
        title.innerHTML = '<i class="fa-solid fa-box-open text-warning me-2"></i>Out of Stock Items';
        subtitle.innerText = "Showing items with zero available quantity";
        renderProductTable(allProductsList.filter(p => p.availableQty <= 0));
    } else {
        title.innerHTML = '<i class="fa-solid fa-boxes-stacked me-2" style="color: var(--nexa-primary);"></i>Master Inventory Catalog';
        subtitle.innerText = "Showing all registered products in system";
        renderProductTable(allProductsList);
    }
}

function handleSearch(query) {
    const trimmedQuery = query.trim().toLowerCase();

    if (trimmedQuery.length === 0) {
        renderProductTable(allProductsList);
        return;
    }

    const filtered = allProductsList.filter(p =>
        p.productName.toLowerCase().includes(trimmedQuery) ||
        p.productCode.toLowerCase().includes(trimmedQuery) ||
        p.categoryCode.toLowerCase().includes(trimmedQuery)
    );

    renderProductTable(filtered);
}
