let allProducts = [];
let cartItems = [];
let selectedCategoryCode = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
    fetchUserProfileHeader();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

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

        if (response.ok && (data.code === 200 || data.status === 200)) {
            const categories = data.body || data.data || [];
            renderCategoriesPills(categories);
        } else {
            console.error("Cannot load categories:", data.message);
        }
    } catch (error) {
        console.error("Categories Fetch Error:", error);
    }
}

function renderCategoriesPills(categories) {
    const container = document.getElementById('categoryPillsContainer');
    if (!container) return;

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

        if (response.ok && (data.code === 200 || data.status === 200)) {
            allProducts = data.body || data.data || [];
            renderProductsGrid(allProducts);
        } else {
            console.error("Cannot load Products:", data.message);
        }
    } catch (error) {
        console.error("Products Fetch Error:", error);
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('txtSearch').value.toLowerCase().trim();

    const filtered = allProducts.filter(p => {
        const matchesSearch = (p.productName && p.productName.toLowerCase().includes(searchTerm)) ||
            (p.productCode && p.productCode.toLowerCase().includes(searchTerm));
        const matchesCat = (selectedCategoryCode === 'ALL') || (p.categoryCode === selectedCategoryCode);
        return matchesSearch && matchesCat;
    });

    renderProductsGrid(filtered);
}

function renderProductsGrid(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="fa-solid fa-box-open fs-1 mb-2"></i>
                <p>No active products match your criteria.</p>
            </div>`;
        return;
    }

    products.forEach(p => {
        const formattedPrice = 'LKR ' + Number(p.unitPrice || 0).toLocaleString('en-US', {minimumFractionDigits: 2});

        let stockBadge = `<span class="badge bg-success-subtle text-success border border-success">In Stock (${p.availableQty})</span>`;
        if (p.availableQty <= 0) {
            stockBadge = `<span class="badge bg-danger-subtle text-danger border border-danger">Out of Stock</span>`;
        } else if (p.availableQty <= (p.minStockLevel || 10)) {
            stockBadge = `<span class="badge bg-warning-subtle text-warning border border-warning">Low Stock (${p.availableQty})</span>`;
        }

        const imgMarkup = p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${p.productName}" onerror="this.onerror=null; this.src='../../images/logo.png';">`
            : `<i class="fa-solid fa-box fs-1 text-secondary opacity-50"></i>`;

        grid.innerHTML += `
            <div class="col">
                <div class="product-card p-3 h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="product-img-wrapper rounded-3 mb-3 d-flex align-items-center justify-content-center bg-light" style="height: 140px;">
                            ${imgMarkup}
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="badge bg-light text-secondary border small">${p.categoryName || 'General'}</span>
                            ${stockBadge}
                        </div>
                        <h6 class="fw-bold mb-1 text-truncate" style="color: var(--nexa-dark);" title="${p.productName}">${p.productName}</h6>
                        <span class="text-muted small d-block mb-2">${p.productCode} • Per ${p.unit || 'ITEM'}</span>
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
    if (badgeCount) badgeCount.innerText = totalItemsCount;
    if (totalTypes) totalTypes.innerText = cartItems.length;

    if (cartItems.length === 0) {
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fa-solid fa-basket-shopping fs-1 mb-2 opacity-50"></i>
                    <p class="small mb-0">Your order cart is currently empty.</p>
                </div>`;
        }
        if (totalPriceEl) totalPriceEl.innerText = 'LKR 0.00';
        if (btnCheckout) btnCheckout.disabled = true;
        return;
    }

    if (btnCheckout) btnCheckout.disabled = false;
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
                        <span class="text-muted" style="font-size: 0.75rem;">${item.productCode} • LKR ${Number(item.unitPrice).toFixed(2)}</span>
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
                    <strong class="text-primary small">LKR ${itemTotal.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}</strong>
                </div>
            </div>
        `;
    });

    if (cartContainer) cartContainer.innerHTML = cartHtml;
    if (totalPriceEl) {
        totalPriceEl.innerText = 'LKR ' + totalPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}


async function handlePlaceOrder() {
    if (cartItems.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
        alert("Session expired. Please login again.");
        window.location.href = '../../index.html';
        return;
    }

    const requestDTO = {
        orderItems: cartItems.map(item => ({
            productCode: item.productCode,
            quantity: item.quantity
        }))
    };

    const btnCheckout = document.getElementById('btnCheckout');
    if (btnCheckout) {
        btnCheckout.disabled = true;
        btnCheckout.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Placing Order...`;
    }

    try {
        const response = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestDTO)
        });

        const result = await response.json();

        if (response.ok && (result.code === 201 || result.status === 201)) {
            const orderData = result.body || result.data;
            showSuccessModal(orderData.orderCode);
            await loadProducts();
        } else {
            alert(result.message || "Failed to place order.");
        }
    } catch (error) {
        console.error("Order Placement Error:", error);
        alert("An error occurred while placing the order.");
    } finally {
        if (btnCheckout) {
            btnCheckout.disabled = false;
            btnCheckout.innerHTML = `<i class="fa-solid fa-paper-plane me-2"></i> Place Wholesale Order`;
        }
    }
}

function showSuccessModal(orderCode) {
    cartItems = [];
    updateCartUI();

    const offcanvasEl = document.getElementById('cartOffcanvas');
    if (offcanvasEl) {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
        bsOffcanvas.hide();
    }

    document.getElementById('modalOrderCode').innerText = '#' + orderCode;


    const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
    successModal.show();
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
        console.error("Cannot load profile details:", err);
    }
}