// Global State
let allProducts = [];
let cartItems = []; // Array of { productCode, productName, unitPrice, availableQty, unit, quantity }
let selectedCategoryCode = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

// 1. GET /api/v1/categories
function loadCategories() {
    fetch('/api/v1/categories', {
        headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
    })
        .then(res => res.json())
        .then(response => {
            if (response.code === 200 && response.data) {
                renderCategoriesPills(response.data);
            }
        })
        .catch(err => {
            // Preview Fallback Categories
            renderCategoriesPills([
                {categoryCode: "CAT-BEV", categoryName: "Beverages"},
                {categoryCode: "CAT-SNK", categoryName: "Snacks & Biscuits"},
                {categoryCode: "CAT-DRY", categoryName: "Dry Provisions"}
            ]);
        });
}

function renderCategoriesPills(categories) {
    const container = document.getElementById('categoryPillsContainer');
    let html = `<button class="category-pill active" onclick="selectCategory('ALL', this)">All Categories</button>`;
    categories.forEach(cat => {
        html += `<button class="category-pill" onclick="selectCategory('${cat.categoryCode}', this)">${cat.categoryName}</button>`;
    });
    container.innerHTML = html;
}

function selectCategory(categoryCode, element) {
    document.querySelectorAll('.category-pill').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    selectedCategoryCode = categoryCode;
    filterProducts();
}

// 2. GET /api/v1/products
function loadProducts() {
    fetch('/api/v1/products', {
        headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
    })
        .then(res => res.json())
        .then(response => {
            if (response.code === 200 && response.data) {
                allProducts = response.data;
                renderProductsGrid(allProducts);
            }
        })
        .catch(err => {
            // Preview Dummy Data (Matching ProductResponseDTO)
            allProducts = [
                {
                    productCode: "PRD-101",
                    productName: "Full Cream Milk Powder 400g",
                    unitPrice: 1050.00,
                    availableQty: 120,
                    unit: "PACKET",
                    categoryCode: "CAT-BEV",
                    categoryName: "Beverages",
                    imageUrl: "../../images/sample-product.png"
                },
                {
                    productCode: "PRD-102",
                    productName: "Ceylon Black Tea 250g",
                    unitPrice: 480.00,
                    availableQty: 45,
                    unit: "BOX",
                    categoryCode: "CAT-BEV",
                    categoryName: "Beverages",
                    imageUrl: ""
                },
                {
                    productCode: "PRD-201",
                    productName: "Chocolate Cream Biscuits 100g",
                    unitPrice: 180.00,
                    availableQty: 8,
                    unit: "PACKET",
                    categoryCode: "CAT-SNK",
                    categoryName: "Snacks & Biscuits",
                    imageUrl: ""
                },
                {
                    productCode: "PRD-301",
                    productName: "White Sugar 1kg Pack",
                    unitPrice: 290.00,
                    availableQty: 300,
                    unit: "PACKET",
                    categoryCode: "CAT-DRY",
                    categoryName: "Dry Provisions",
                    imageUrl: ""
                }
            ];
            renderProductsGrid(allProducts);
        });
}

function filterProducts() {
    const searchTerm = document.getElementById('txtSearch').value.toLowerCase().trim();

    const filtered = allProducts.filter(p => {
        const matchesSearch = p.productName.toLowerCase().includes(searchTerm) || p.productCode.toLowerCase().includes(searchTerm);
        const matchesCat = (selectedCategoryCode === 'ALL') || (p.categoryCode === selectedCategoryCode);
        return matchesSearch && matchesCat;
    });

    renderProductsGrid(filtered);
}

function renderProductsGrid(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center py-5 text-muted"><i class="fa-solid fa-box-open fs-1 mb-2"></i><p>No active products match your criteria.</p></div>`;
        return;
    }

    products.forEach(p => {
        const formattedPrice = 'LKR ' + p.unitPrice.toLocaleString('en-US', {minimumFractionDigits: 2});
        let stockBadge = `<span class="badge bg-success-subtle text-success border border-success">In Stock (${p.availableQty})</span>`;
        if (p.availableQty <= 0) {
            stockBadge = `<span class="badge bg-danger-subtle text-danger border border-danger">Out of Stock</span>`;
        } else if (p.availableQty <= 10) {
            stockBadge = `<span class="badge bg-warning-subtle text-warning border border-warning">Low Stock (${p.availableQty})</span>`;
        }

        const imgMarkup = p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.productName}" onerror="this.onerror=null; this.src='../../images/logo.png';">`
            : `<i class="fa-solid fa-box fs-1 text-secondary opacity-50"></i>`;

        grid.innerHTML += `
                <div class="col">
                    <div class="product-card p-3">
                        <div>
                            <div class="product-img-wrapper rounded-3 mb-3">
                                ${imgMarkup}
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="badge bg-light text-secondary border small">${p.categoryName || 'General'}</span>
                                ${stockBadge}
                            </div>
                            <h6 class="fw-bold mb-1 text-truncate" style="color: var(--nexa-dark);" title="${p.productName}">${p.productName}</h6>
                            <span class="text-muted small d-block mb-2">${p.productCode} • Per ${p.unit}</span>
                        </div>
                        <div class="pt-2 border-top">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="fw-bold text-primary fs-6">${formattedPrice}</span>
                            </div>
                            <button class="btn btn-sm btn-outline-primary w-100 rounded-pill fw-semibold"
                                    onclick="addToCart('${p.productCode}')" ${p.availableQty <= 0 ? 'disabled' : ''}>
                                <i class="fa-solid fa-plus me-1"></i> Add to Order Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
    });
}

// CART MANAGEMENT LOGIC
function addToCart(productCode) {
    const product = allProducts.find(p => p.productCode === productCode);
    if (!product) return;

    const existing = cartItems.find(item => item.productCode === productCode);
    if (existing) {
        if (existing.quantity < product.availableQty) {
            existing.quantity++;
        } else {
            alert(`Cannot add more than available stock (${product.availableQty})`);
        }
    } else {
        cartItems.push({
            productCode: product.productCode,
            productName: product.productName,
            unitPrice: product.unitPrice,
            availableQty: product.availableQty,
            unit: product.unit,
            quantity: 1
        });
    }
    updateCartUI();
}

function updateCartQuantity(productCode, change) {
    const item = cartItems.find(i => i.productCode === productCode);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        cartItems = cartItems.filter(i => i.productCode !== productCode);
    } else if (item.quantity > item.availableQty) {
        item.quantity = item.availableQty;
        alert("Maximum available stock reached!");
    }
    updateCartUI();
}

function removeFromCart(productCode) {
    cartItems = cartItems.filter(i => i.productCode !== productCode);
    updateCartUI();
}

function updateCartUI() {
    const cartContainer = document.getElementById('cartItemsList');
    const badgeCount = document.getElementById('cartBadgeCount');
    const totalTypes = document.getElementById('lblCartTotalTypes');
    const totalPriceEl = document.getElementById('lblCartTotalPrice');
    const btnCheckout = document.getElementById('btnCheckout');

    const totalItemsCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
    badgeCount.innerText = totalItemsCount;
    totalTypes.innerText = cartItems.length;

    if (cartItems.length === 0) {
        cartContainer.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fa-solid fa-basket-shopping fs-1 mb-2 opacity-50"></i>
                    <p class="small mb-0">Your order cart is currently empty.</p>
                </div>`;
        totalPriceEl.innerText = 'LKR 0.00';
        btnCheckout.disabled = true;
        return;
    }

    btnCheckout.disabled = false;
    let cartHtml = '';
    let totalPrice = 0;

    cartItems.forEach(item => {
        const itemTotal = item.unitPrice * item.quantity;
        totalPrice += itemTotal;

        cartHtml += `
                <div class="p-2 mb-2 bg-light rounded-3 border">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong class="small text-dark d-block">${item.productName}</strong>
                            <span class="text-muted" style="font-size: 0.75rem;">${item.productCode} • LKR ${item.unitPrice.toFixed(2)}</span>
                        </div>
                        <button class="btn btn-link btn-sm text-danger p-0 ms-2" onclick="removeFromCart('${item.productCode}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div class="input-group input-group-sm" style="width: 100px;">
                            <button class="btn btn-outline-secondary" onclick="updateCartQuantity('${item.productCode}', -1)">-</button>
                            <span class="form-control text-center bg-white px-1 fw-bold">${item.quantity}</span>
                            <button class="btn btn-outline-secondary" onclick="updateCartQuantity('${item.productCode}', 1)">+</button>
                        </div>
                        <strong class="text-primary small">LKR ${itemTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</strong>
                    </div>
                </div>
            `;
    });

    cartContainer.innerHTML = cartHtml;
    totalPriceEl.innerText = 'LKR ' + totalPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// 3. POST /api/v1/orders (Place Order Request)
function handlePlaceOrder() {
    if (cartItems.length === 0) return;

    const requestDTO = {
        orderItems: cartItems.map(item => ({
            productCode: item.productCode,
            quantity: item.quantity
        }))
    };

    fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestDTO)
    })
        .then(res => res.json())
        .then(response => {
            if (response.code === 201 && response.data) {
                const orderData = response.data; // OrderResponseDTO
                showSuccessModal(orderData.orderCode);
            } else {
                alert(response.message || "Failed to place order.");
            }
        })
        .catch(err => {
            // Preview Fallback Simulation
            const dummyOrderCode = "ORD-" + Math.floor(1000 + Math.random() * 9000);
            showSuccessModal(dummyOrderCode);
        });
}

function showSuccessModal(orderCode) {
    // Clear Cart
    cartItems = [];
    updateCartUI();

    // Close Offcanvas
    const offcanvasEl = document.getElementById('cartOffcanvas');
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    if (bsOffcanvas) bsOffcanvas.hide();

    // Populate Modal & Hook PDF Download
    document.getElementById('modalOrderCode').innerText = '#' + orderCode;
    const pdfBtn = document.getElementById('btnDownloadPdfModal');
    pdfBtn.onclick = () => downloadInvoicePdf(orderCode);

    // Show Modal
    const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
    successModal.show();
}

// 4. GET /api/v1/orders/{orderCode}/pdf Download handler
function downloadInvoicePdf(orderCode) {
    window.open(`/api/v1/orders/${orderCode}/pdf`, '_blank');
}