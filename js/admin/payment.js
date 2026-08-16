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


// GET /api/v1/payments
function loadPayments() {

}

// PUT /api/v1/payments/pay
function openProcessPaymentModal(paymentCode, defaultDueAmount) {
    document.getElementById('payModalPaymentCode').value = paymentCode;
    document.getElementById('payModalAmount').value = defaultDueAmount || '';
    processPaymentModalBS.show();
}

function handleProcessPaymentSubmit(e) {
    e.preventDefault();

    const dto = {
        paymentCode: document.getElementById('payModalPaymentCode').value,
        payingAmount: parseFloat(document.getElementById('payModalAmount').value)
    };


    alert(`Payment processed successfully for ${dto.paymentCode}!`);
    processPaymentModalBS.hide();
}

function filterPayments() {
    const query = document.getElementById('searchPaymentInput').value.toLowerCase().trim();

    const filtered = allPaymentsList.filter(p => {
        return p.paymentCode.toLowerCase().includes(query) ||
            p.orderCode.toLowerCase().includes(query);
    });

    renderPaymentsTable(filtered);
}

function renderPaymentsTable(payments) {
    // Dynamic rendering logic for Payments table
}


// GET /api/v1/credit-ledgers
function loadLedger() {

}

function filterLedgers() {
    const typeFilter = document.getElementById('filterLedgerType').value;
    const query = document.getElementById('searchLedgerInput').value.toLowerCase().trim();

    const filtered = allLedgersList.filter(ldg => {
        const matchesType = (typeFilter === 'ALL' || ldg.ledgerType === typeFilter);
        const matchesQuery = (ldg.customerName && ldg.customerName.toLowerCase().includes(query)) ||
            (ldg.userCode && ldg.userCode.toLowerCase().includes(query)) ||
            ldg.referenceCode.toLowerCase().includes(query) ||
            ldg.ledgerCode.toLowerCase().includes(query);

        return matchesType && matchesQuery;
    });

    renderLedgerTable(filtered);
}

function renderLedgerTable(ledgers) {
    // Dynamic rendering logic for Ledger table
}


// GET /api/v1/audit-logs
function loadAuditLogs() {

}

function filterAuditLogs() {
    const query = document.getElementById('searchAuditInput').value.toLowerCase().trim();

    const filtered = allAuditLogsList.filter(log => {
        return log.userEmail.toLowerCase().includes(query) ||
            log.action.toLowerCase().includes(query);
    });

    renderAuditTable(filtered);
}

function renderAuditTable(logs) {
    // Dynamic rendering logic for Audit logs table
}