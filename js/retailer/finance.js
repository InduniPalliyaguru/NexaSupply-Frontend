let rawLedgerList = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchMyLedgerEntries();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

// 1. GET /api/v1/credit-ledger/reference/{referenceCode}
function fetchMyLedgerEntries() {
    const userRefCode = localStorage.getItem('referenceCode') || 'RET-0001';

    fetch(`/api/v1/credit-ledger/reference/${userRefCode}`, {
        headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
    })
        .then(res => res.json())
        .then(response => {
            if (response.code === 200 && response.data) {
                rawLedgerList = response.data;
                renderLedgerTable(rawLedgerList);
                calculateMetrics(rawLedgerList);
            }
        })
        .catch(err => {
            // Dummy Data Preview (Matching exact LedgerType Enum)
            rawLedgerList = [
                {
                    ledgerCode: "LDG-1001",
                    referenceCode: userRefCode,
                    amount: 150000.00,
                    balanceAfter: 150000.00,
                    ledgerType: "ADMIN_ADJUSTMENT",
                    description: "Initial credit limit assigned by System Admin",
                    transactionDate: "2026-08-01T09:00:00"
                },
                {
                    ledgerCode: "LDG-1002",
                    referenceCode: userRefCode,
                    amount: 48500.00,
                    balanceAfter: 101500.00,
                    ledgerType: "ORDER_DEDUCTION",
                    description: "Deducted for purchase order #ORD-94021",
                    transactionDate: "2026-08-16T14:30:00"
                },
                {
                    ledgerCode: "LDG-1003",
                    referenceCode: userRefCode,
                    amount: 18400.00,
                    balanceAfter: 119900.00,
                    ledgerType: "ORDER_CANCEL_REFUND",
                    description: "Refunded for cancelled order #ORD-94110",
                    transactionDate: "2026-08-16T17:10:00"
                },
                {
                    ledgerCode: "LDG-1004",
                    referenceCode: userRefCode,
                    amount: 30000.00,
                    balanceAfter: 149900.00,
                    ledgerType: "PAYMENT_RESTORATION",
                    description: "Bank transfer payment top-up verified",
                    transactionDate: "2026-08-17T08:15:00"
                }
            ];
            renderLedgerTable(rawLedgerList);
            calculateMetrics(rawLedgerList);
        });
}

function renderLedgerTable(ledgers) {
    const tbody = document.getElementById('ledgerTableBody');
    tbody.innerHTML = '';

    if (ledgers.length === 0) {
        tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                        <i class="fa-solid fa-receipt fs-2 mb-2 d-block"></i>
                        No credit ledger records found for your account.
                    </td>
                </tr>`;
        return;
    }

    ledgers.forEach(item => {
        const formattedDate = item.transactionDate ? new Date(item.transactionDate).toLocaleString() : 'N/A';
        const formattedAmount = 'LKR ' + (item.amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
        const formattedBalance = 'LKR ' + (item.balanceAfter || 0).toLocaleString('en-US', {minimumFractionDigits: 2});

        // ORDER_DEDUCTION is Debit (-), others represent Credit (+)
        const isDeduction = item.ledgerType === 'ORDER_DEDUCTION';

        tbody.innerHTML += `
                <tr>
                    <td class="ps-4 fw-bold text-dark">${item.ledgerCode}</td>
                    <td><span class="badge bg-light text-muted border">${item.referenceCode}</span></td>
                    <td class="text-muted small">${formattedDate}</td>
                    <td>
                        <span class="ledger-type-badge type-${item.ledgerType}">${item.ledgerType.replace(/_/g, ' ')}</span>
                    </td>
                    <td class="text-end fw-bold ${isDeduction ? 'text-danger' : 'text-success'}">
                        ${isDeduction ? '-' : '+'}${formattedAmount}
                    </td>
                    <td class="text-end fw-bold text-dark">${formattedBalance}</td>
                    <td class="pe-4 ps-4 text-muted small text-wrap" style="max-width: 250px;">
                        ${item.description || '-'}
                    </td>
                </tr>
            `;
    });
}

function calculateMetrics(ledgers) {
    let totalDeductions = 0;
    let totalRestorations = 0;
    let currentBalance = 0;

    if (ledgers.length > 0) {
        // BalanceAfter of latest transaction reflects actual available balance
        currentBalance = ledgers[ledgers.length - 1].balanceAfter || 0;

        ledgers.forEach(l => {
            if (l.ledgerType === 'ORDER_DEDUCTION') {
                totalDeductions += l.amount;
            } else if (['ORDER_CANCEL_REFUND', 'PAYMENT_RESTORATION', 'ADMIN_ADJUSTMENT'].includes(l.ledgerType)) {
                totalRestorations += l.amount;
            }
        });
    }

    document.getElementById('lblCurrentBalance').innerText = 'LKR ' + currentBalance.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('lblTotalDeductions').innerText = 'LKR ' + totalDeductions.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById('lblTotalRestorations').innerText = 'LKR ' + totalRestorations.toLocaleString('en-US', {minimumFractionDigits: 2});
}

function filterLedger() {
    const searchTerm = document.getElementById('txtSearchLedger').value.toLowerCase().trim();
    const selectedType = document.getElementById('cmbLedgerTypeFilter').value;

    const filtered = rawLedgerList.filter(item => {
        const matchesSearch = item.ledgerCode.toLowerCase().includes(searchTerm) ||
            item.referenceCode.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm));
        const matchesType = (selectedType === 'ALL') || (item.ledgerType === selectedType);
        return matchesSearch && matchesType;
    });

    renderLedgerTable(filtered);
}