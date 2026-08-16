let productModalBS;
let manageCategoriesModalBS;
let addCategoryModalBS;

document.addEventListener('DOMContentLoaded', () => {
    productModalBS = new bootstrap.Modal(document.getElementById('productModal'));
    manageCategoriesModalBS = new bootstrap.Modal(document.getElementById('manageCategoriesModal'));
    addCategoryModalBS = new bootstrap.Modal(document.getElementById('addCategoryModal'));

    loadCategories();
});

// Mobile Sidebar Drawer Toggle Logic
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

// Category Controller Integration
function loadCategories() {
    // Fetch GET /api/v1/categories
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

function handleCategorySubmit(e) {
    e.preventDefault();
    const isEdit = document.getElementById('categoryIsEdit').value === "true";
    const code = document.getElementById('categoryCodeHidden').value;

    const categoryPayload = {
        categoryName: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };

    if (isEdit) {
        // Executed: PUT /api/v1/categories/{code}
    } else {
        // Executed: POST /api/v1/categories
    }
    addCategoryModalBS.hide();
}

function deleteCategory(code) {
    if (confirm(`Are you sure you want to delete category ${code}?`)) {
        // Executed: DELETE /api/v1/categories/{code}
    }
}

// Product Controller Integration
function openAddModal() {
    document.getElementById('productForm').reset();
    document.getElementById('isEditMode').value = "false";
    document.getElementById('modalTitle').innerText = "Add New Product";
    document.getElementById('productCode').readOnly = false;
    document.getElementById('btnSaveProduct').innerText = "Save Product";
    productModalBS.show();
}

function openEditModal(code) {
    document.getElementById('productForm').reset();
    document.getElementById('isEditMode').value = "true";
    document.getElementById('modalTitle').innerText = "Edit Product (" + code + ")";
    document.getElementById('productCode').value = code;
    document.getElementById('productCode').readOnly = true;
    document.getElementById('btnSaveProduct').innerText = "Update Product";

    // Fetch GET /api/v1/products/{code}
    productModalBS.show();
}

function handleProductSubmit(e) {
    e.preventDefault();
    const isEdit = document.getElementById('isEditMode').value === "true";
    const productPayload = {
        productCode: document.getElementById('productCode').value,
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        unitPrice: parseFloat(document.getElementById('unitPrice').value),
        availableQty: parseInt(document.getElementById('availableQty').value),
        unit: document.getElementById('unit').value,
        minStockLevel: parseInt(document.getElementById('minStockLevel').value || 0),
        imgUrl: document.getElementById('imgUrl').value,
        categoryCode: document.getElementById('categoryCode').value
    };

    if (isEdit) {
        // Executed: PUT /api/v1/products
    } else {
        // Executed: POST /api/v1/products
    }
    productModalBS.hide();
}

function filterTable(filterType) {
    const title = document.getElementById('tableTitle');
    const subtitle = document.getElementById('tableSubTitle');

    if (filterType === 'LOW_STOCK') {
        title.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-danger me-2"></i>Low Stock Alerts';
        subtitle.innerText = "Showing items where available quantity is below minimum stock level";
    } else if (filterType === 'OUT_OF_STOCK') {
        title.innerHTML = '<i class="fa-solid fa-box-open text-warning me-2"></i>Out of Stock Items';
        subtitle.innerText = "Showing items with zero available quantity";
    } else {
        title.innerHTML = '<i class="fa-solid fa-boxes-stacked me-2" style="color: var(--nexa-primary);"></i>Master Inventory Catalog';
        subtitle.innerText = "Showing all registered products in system";
    }
}

function handleSearch(query) {
    if (query.trim().length > 0) {
        // Executed: GET /api/v1/products/search?query=...
    }
}

function deleteProduct(code) {
    if (confirm(`Are you sure you want to delete product ${code}?`)) {
        // Executed: DELETE /api/v1/products/{code}
    }
}