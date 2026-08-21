let processPaymentModalBS;
let allPaymentsList = [];
let allLedgersList = [];
let allAuditLogsList = [];

document.addEventListener('DOMContentLoaded', () => {
    processPaymentModalBS = new bootstrap.Modal(document.getElementById('processPaymentModal'));

    loadPayments();
    loadLedger();
    loadAuditLogs();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

async function loadPayments() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/payments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (response.ok || data.code === 200) {
            allPaymentsList = data.body || data.data || [];
            renderPaymentsTable(allPaymentsList);
        } else {
            console.error("Failed to load payments:", data.message);
        }
    } catch (err) {
        console.error("Error loading payments:", err);
    }
}

function renderPaymentsTable(payments) {
    const tbody = document.getElementById('paymentsTableBody');
    tbody.innerHTML = '';

    if (!payments || payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No payment records found</td></tr>`;
        return;
    }
    payments.forEach(p => {
        let badgeClass = 'bg-secondary';
        if (p.paymentStatus === 'COMPLETED') {
            badgeClass = 'badge-pay-paid';
        } else if (p.paymentStatus === 'PARTIAL') {
            badgeClass = 'badge-pay-partial';
        } else if (p.paymentStatus === 'PENDING') {
            badgeClass = 'bg-danger';
        }

        const isCompleted = p.paymentStatus === 'COMPLETED' || p.balanceAmount <= 0;

        let actionButtonHtml = '';
        if (isCompleted) {
            actionButtonHtml = `
                <button class="btn btn-light btn-sm rounded-pill px-3 text-muted" disabled>
                    <i class="fa-solid fa-circle-check text-success me-1"></i> Completed
                </button>`;
        } else {
            actionButtonHtml = `
                <button class="btn text-white btn-sm rounded-pill px-3"
                        style="background: var(--nexa-primary);"
                        onclick="openProcessPaymentModal('${p.paymentCode}', ${p.balanceAmount})">
                    <i class="fa-solid fa-hand-holding-dollar me-1"></i> Process Pay
                </button>`;
        }

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold" style="color: var(--nexa-primary);">${p.paymentCode}</td>
                <td class="fw-bold text-dark">${p.orderCode || p.OrderCode || '-'}</td>
                <td class="fw-semibold">LKR ${Number(p.totalAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="text-success fw-semibold">LKR ${Number(p.paidAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="text-danger fw-semibold">LKR ${Number(p.balanceAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td><span class="badge ${badgeClass} rounded-pill px-3 py-2">${p.paymentStatus}</span></td>
                <td class="text-end">${actionButtonHtml}</td>
            </tr>
        `;
    });
}

function openProcessPaymentModal(paymentCode, defaultDueAmount) {
    document.getElementById('payModalPaymentCode').value = paymentCode;
    document.getElementById('payModalAmount').value = defaultDueAmount || '';
    processPaymentModalBS.show();
}

async function handleProcessPaymentSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const dto = {
        paymentCode: document.getElementById('payModalPaymentCode').value,
        payingAmount: parseFloat(document.getElementById('payModalAmount').value)
    };

    try {
        const response = await fetch(`${BASE_URL}/payments/pay`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dto)
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            alert(data.message || `Payment processed successfully for ${dto.paymentCode}!`);
            processPaymentModalBS.hide();

            await loadPayments();
            await loadLedger();
            await loadAuditLogs();
        } else {
            alert(data.message || "Failed to process payment!");
        }
    } catch (err) {
        console.error("Error processing payment:", err);
    }
}

function filterPayments() {
    const query = document.getElementById('searchPaymentInput').value.toLowerCase().trim();

    const filtered = allPaymentsList.filter(p => {
        const payCode = p.paymentCode ? p.paymentCode.toLowerCase() : '';
        const ordCode = (p.orderCode || p.OrderCode) ? (p.orderCode || p.OrderCode).toLowerCase() : '';
        return payCode.includes(query) || ordCode.includes(query);
    });
    renderPaymentsTable(filtered);
}


async function loadLedger() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/credit-ledgers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            allLedgersList = data.body || data.data || [];
            renderLedgerTable(allLedgersList);
        } else {
            console.error("Failed to load ledgers:", data.message);
        }
    } catch (err) {
        console.error("Error loading ledgers:", err);
    }
}

function renderLedgerTable(ledgers) {
    const tbody = document.getElementById('ledgerTableBody');
    tbody.innerHTML = '';

    if (!ledgers || ledgers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No credit ledger records found</td></tr>`;
        return;
    }

    ledgers.forEach(l => {
        let formattedDate = l.transactionDate ? new Date(l.transactionDate).toLocaleString() : '-';

        let badgeClass = 'bg-secondary';
        let amountClass = 'text-dark';

        if (l.ledgerType === 'ORDER_DEDUCTION') {
            badgeClass = 'badge-ledger-deduction';
            amountClass = 'text-danger';
        } else if (l.ledgerType === 'PAYMENT_RESTORATION' || l.ledgerType === 'ORDER_CANCEL_REFUND') {
            badgeClass = 'badge-ledger-restoration';
            amountClass = 'text-success';
        } else if (l.ledgerType === 'ADMIN_ADJUSTMENT') {
            badgeClass = 'bg-info text-dark';
            amountClass = 'text-primary';
        }

        tbody.innerHTML += `
            <tr>
                <td class="fw-bold" style="color: var(--nexa-primary);">${l.ledgerCode}</td>
                <td>
                    <div><span class="fw-bold text-dark">${l.customerName || '-'}</span></div>
                    <small class="text-muted">${l.userCode || '-'}</small>
                </td>
                <td class="fw-semibold">${l.referenceCode || '-'}</td>
                <td><span class="badge ${badgeClass} rounded-pill px-3 py-1">${l.ledgerType}</span></td>
                <td class="${amountClass} fw-semibold">LKR ${Number(l.amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="fw-bold text-dark">LKR ${Number(l.balanceAfter || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="text-muted small">${formattedDate}</td>
                <td class="text-muted small">${l.description || '-'}</td>
            </tr>
        `;
    });
}

function filterLedgers() {
    const typeFilter = document.getElementById('filterLedgerType').value;
    const query = document.getElementById('searchLedgerInput').value.toLowerCase().trim();

    const filtered = allLedgersList.filter(ldg => {
        const matchesType = (typeFilter === 'ALL' || ldg.ledgerType === typeFilter);

        const customerName = ldg.customerName ? ldg.customerName.toLowerCase() : '';
        const userCode = ldg.userCode ? ldg.userCode.toLowerCase() : '';
        const refCode = ldg.referenceCode ? ldg.referenceCode.toLowerCase() : '';
        const ldgCode = ldg.ledgerCode ? ldg.ledgerCode.toLowerCase() : '';

        const matchesQuery = !query ||
            customerName.includes(query) ||
            userCode.includes(query) ||
            refCode.includes(query) ||
            ldgCode.includes(query);

        return matchesType && matchesQuery;
    });
    renderLedgerTable(filtered);
}


async function loadAuditLogs() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/admin/audit-logs`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok || data.code === 200) {
            allAuditLogsList = data.body || data.data || [];
            renderAuditTable(allAuditLogsList);
        } else {
            console.error("Failed to load audit logs:", data.message);
        }
    } catch (err) {
        console.error("Error loading audit logs:", err);
    }
}

function renderAuditTable(logs) {
    const tbody = document.getElementById('auditTableBody');
    tbody.innerHTML = '';

    if (!logs || logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">No audit logs found</td></tr>`;
        return;
    }

    logs.forEach(log => {
        let formattedDate = log.actionDate ? new Date(log.actionDate).toLocaleString() : '-';

        const isAdmin = log.userEmail && log.userEmail.includes('admin');
        const userIcon = isAdmin ? 'fa-user-shield text-primary' : 'fa-user text-secondary';

        tbody.innerHTML += `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <i class="fa-solid ${userIcon}"></i>
                        <span class="fw-semibold text-dark">${log.userEmail || 'System'}</span>
                    </div>
                </td>
                <td><span class="badge bg-light text-dark border px-3 py-2">${log.action || '-'}</span></td>
                <td class="text-muted small">${formattedDate}</td>
            </tr>
        `;
    });
}

function filterAuditLogs() {
    const query = document.getElementById('searchAuditInput').value.toLowerCase().trim();

    const filtered = allAuditLogsList.filter(log => {
        const email = log.userEmail ? log.userEmail.toLowerCase() : '';
        const action = log.action ? log.action.toLowerCase() : '';

        return email.includes(query) || action.includes(query);
    });
    renderAuditTable(filtered);
}
