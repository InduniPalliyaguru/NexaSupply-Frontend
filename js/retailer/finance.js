let rawLedgerList = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfileAndLedger();
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}

async function fetchUserProfileAndLedger() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../index.html';
        return;
    }

    try {
        const profileResponse = await fetch(`${BASE_URL}/users/profile`, {
            method: 'GET',
            headers: {'Authorization': `Bearer ${token}`}
        });

        const profileData = await profileResponse.json();

        if (profileResponse.ok && (profileData.code === 200 || profileData.status === 200)) {
            const user = profileData.body || profileData.data;

            if (user && user.fullName) {
                const nameElem = document.getElementById('headerName');
                const emailElem = document.getElementById('profileEmail');
                const avatarElem = document.getElementById('headerAvatar');
                if (nameElem) nameElem.innerText = user.fullName;
                if (emailElem) emailElem.innerText = user.email || '';
                if (avatarElem) avatarElem.innerText = user.fullName.charAt(0).toUpperCase();
            }

            const userCode = user.userCode || user.referenceCode || localStorage.getItem('userCode');
            if (userCode) {
                await fetchLedgerEntriesByUserCode(userCode, token);
            } else {
                renderLedgerTable([]);
            }
        } else {
            console.error("User Profile Load Error:", profileData.message);
        }
    } catch (error) {
        console.error("Profile Fetch Error:", error);
    }
}

async function fetchLedgerEntriesByUserCode(userCode, token) {
    try {
        const response = await fetch(`${BASE_URL}/credit-ledgers/user/${userCode}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && (result.code === 200 || result.status === 200)) {
            let data = result.body || result.data || [];

            calculateMetrics(data);

            rawLedgerList = [...data].reverse();

            renderLedgerTable(rawLedgerList);
        } else {
            console.error("Ledger Data Load Error:", result.message);
            renderLedgerTable([]);
            calculateMetrics([]);
        }
    } catch (error) {
        console.error("Ledger Fetch Error:", error);
        renderLedgerTable([]);
        calculateMetrics([]);
    }
}

function renderLedgerTable(ledgers) {
    const tbody = document.getElementById('ledgerTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!ledgers || ledgers.length === 0) {
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
        const formattedAmount = 'LKR ' + Number(item.amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2});
        const formattedBalance = 'LKR ' + Number(item.balanceAfter || 0).toLocaleString('en-US', {minimumFractionDigits: 2});

        const isDeduction = item.ledgerType === 'ORDER_DEDUCTION';

        tbody.innerHTML += `
            <tr>
                <td class="ps-4 fw-bold text-dark">${item.ledgerCode || '-'}</td>
                <td><span class="badge bg-light text-muted border">${item.referenceCode || '-'}</span></td>
                <td class="text-muted small">${formattedDate}</td>
                <td>
                    <span class="ledger-type-badge type-${item.ledgerType}">${(item.ledgerType || '').replace(/_/g, ' ')}</span>
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

    if (ledgers && ledgers.length > 0) {
        currentBalance = ledgers[ledgers.length - 1].balanceAfter || 0;

        ledgers.forEach(l => {
            if (l.ledgerType === 'ORDER_DEDUCTION') {
                totalDeductions += (l.amount || 0);
            } else if (['ORDER_CANCEL_REFUND', 'PAYMENT_RESTORATION', 'ADMIN_ADJUSTMENT'].includes(l.ledgerType)) {
                totalRestorations += (l.amount || 0);
            }
        });
    }

    const lblCurrentBalance = document.getElementById('lblCurrentBalance');
    const lblTotalDeductions = document.getElementById('lblTotalDeductions');
    const lblTotalRestorations = document.getElementById('lblTotalRestorations');

    if (lblCurrentBalance) lblCurrentBalance.innerText = 'LKR ' + currentBalance.toLocaleString('en-US', {minimumFractionDigits: 2});
    if (lblTotalDeductions) lblTotalDeductions.innerText = 'LKR ' + totalDeductions.toLocaleString('en-US', {minimumFractionDigits: 2});
    if (lblTotalRestorations) lblTotalRestorations.innerText = 'LKR ' + totalRestorations.toLocaleString('en-US', {minimumFractionDigits: 2});
}

function filterLedger() {
    const searchTerm = document.getElementById('txtSearchLedger').value.toLowerCase().trim();
    const selectedType = document.getElementById('cmbLedgerTypeFilter').value;

    const filtered = rawLedgerList.filter(item => {
        const matchesSearch = (item.ledgerCode && item.ledgerCode.toLowerCase().includes(searchTerm)) ||
            (item.referenceCode && item.referenceCode.toLowerCase().includes(searchTerm)) ||
            (item.description && item.description.toLowerCase().includes(searchTerm));
        const matchesType = (selectedType === 'ALL') || (item.ledgerType === selectedType);
        return matchesSearch && matchesType;
    });

    renderLedgerTable(filtered);
}