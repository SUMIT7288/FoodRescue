document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth('ADMIN')) return;
  await loadAdmin();
});

async function loadAdmin() {
  const [users, donations, requests] = await Promise.all([
    API.get('users'),
    API.get('donations'),
    API.get('requests')
  ]);

  document.getElementById('admin-total-users').textContent = users.length;
  document.getElementById('admin-total-donations').textContent = donations.length;
  document.getElementById('admin-total-requests').textContent = requests.filter(r => r.status === 'PENDING').length;

  const rescued = donations.filter(d => d.status === 'COMPLETED').reduce((s, d) => s + (Number(d.quantity) || 0), 0);
  document.getElementById('admin-meals-rescued').textContent = rescued;

  const userBody = document.getElementById('adminUsersTable');
  userBody.replaceChildren();
  users.forEach(u => {
    const tr = el('tr');
    tr.append(
      el('td', 'fw-bold', u.orgName || u.name),
      el('td', '', u.role),
      el('td', 'small', u.phone || u.email)
    );
    userBody.appendChild(tr);
  });

  const donBody = document.getElementById('adminDonationsTable');
  donBody.replaceChildren();
  donations.forEach(d => {
    const tr = el('tr');
    const delBtn = el('button', 'btn btn-outline-danger btn-sm', 'Delete');
    delBtn.onclick = async () => {
      if (confirm('Delete this donation from system?')) {
        await API.delete('donations', d.id);
        loadAdmin();
      }
    };
    const tdAction = el('td');
    tdAction.appendChild(delBtn);

    tr.append(
      el('td', 'small fw-bold', d.restaurantName),
      el('td', '', `${d.foodName} (${d.quantity} ${d.unit})`),
      el('td', '', d.status),
      tdAction
    );
    donBody.appendChild(tr);
  });

  const reqBody = document.getElementById('adminRequestsTable');
  reqBody.replaceChildren();
  requests.forEach(r => {
    const donation = donations.find(d => String(d.id) === String(r.donationId));
    const tr = el('tr');
    tr.append(
      el('td', 'small', r.createdAt),
      el('td', 'fw-bold', r.ngoName),
      el('td', '', donation ? donation.foodName : 'Deleted Item'),
      el('td', '', r.requestedQuantity),
      el('td', '', r.status)
    );
    reqBody.prepend(tr);
  });
}