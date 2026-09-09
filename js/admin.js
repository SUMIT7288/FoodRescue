document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Authentication
    const currentUser = checkAuth('ADMIN');
    if (!currentUser) return;

    renderAdminDashboard();
});

function renderAdminDashboard() {
    const users = Storage.getData(KEYS.USERS);
    const donations = Storage.getData(KEYS.DONATIONS);
    const requests = Storage.getData(KEYS.REQUESTS);

    // Update Global Stats
    document.getElementById('admin-total-users').innerText = users.length;
    document.getElementById('admin-total-donations').innerText = donations.length;
    document.getElementById('admin-total-requests').innerText = requests.filter(r => r.status === 'PENDING').length;
    
    const rescuedMeals = donations
        .filter(d => d.status === 'COMPLETED')
        .reduce((sum, d) => sum + parseInt(d.quantity), 0);
    document.getElementById('admin-meals-rescued').innerText = rescuedMeals;

    renderUsersTable(users);
    renderDonationsTable(donations);
    renderRequestsTable(requests, donations);
}

function renderUsersTable(users) {
    const tbody = document.getElementById('adminUsersTable');
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>
                <div class="fw-bold">${u.orgName || u.name}</div>
                <div class="small text-muted">${u.email}</div>
            </td>
            <td><span class="badge ${u.role === 'NGO' ? 'bg-success' : u.role === 'ADMIN' ? 'bg-dark' : 'bg-primary'}">${u.role}</span></td>
            <td class="small">${u.phone || 'N/A'}</td>
        </tr>
    `).join('');
}

function renderDonationsTable(donations) {
    const tbody = document.getElementById('adminDonationsTable');
    document.getElementById('donationCountBadge').innerText = `${donations.length} Total`;

    if (donations.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4">No donations found.</td></tr>`;
        return;
    }

    tbody.innerHTML = donations.map(d => `
        <tr>
            <td class="small fw-bold">${d.restaurantName}</td>
            <td>
                <div class="fw-bold">${d.foodName}</div>
                <div class="small text-muted">${d.quantity} ${d.unit}</div>
            </td>
            <td><span class="badge bg-${getStatusColor(d.status)}">${d.status}</span></td>
            <td>
                <button onclick="adminDeleteDonation(${d.id})" class="btn btn-outline-danger btn-sm">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).reverse().join('');
}

function renderRequestsTable(requests, donations) {
    const tbody = document.getElementById('adminRequestsTable');

    if (requests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">No requests made yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = requests.map(r => {
        const donation = donations.find(d => d.id === r.donationId);
        return `
            <tr>
                <td class="small">${r.createdAt}</td>
                <td class="fw-bold">${r.ngoName}</td>
                <td>${donation ? donation.foodName : '<span class="text-danger">Deleted Item</span>'}</td>
                <td>${r.requestedQuantity}</td>
                <td><span class="badge bg-${getStatusColor(r.status)}">${r.status}</span></td>
            </tr>
        `;
    }).reverse().join('');
}

function adminDeleteDonation(id) {
    if (confirm('ADMIN ACTION: Are you sure you want to delete this donation from the system?')) {
        let donations = Storage.getData(KEYS.DONATIONS);
        donations = donations.filter(d => d.id !== id);
        Storage.saveData(KEYS.DONATIONS, donations);
        
        // Also clean up requests associated with this donation
        let requests = Storage.getData(KEYS.REQUESTS);
        requests = requests.filter(r => r.donationId !== id);
        Storage.saveData(KEYS.REQUESTS, requests);

        showToast('Donation and related requests removed by admin.', 'danger');
        renderAdminDashboard();
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'AVAILABLE': return 'primary';
        case 'PENDING': return 'warning';
        case 'APPROVED': return 'info';
        case 'COMPLETED': return 'success';
        case 'REJECTED': return 'danger';
        default: return 'secondary';
    }
}