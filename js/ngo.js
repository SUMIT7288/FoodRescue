let currentUser = null;
let donationsCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = checkAuth('NGO');
  if (!currentUser) return;

  document.getElementById('ngoDisplayName').textContent = `Welcome, ${currentUser.orgName || currentUser.name}`;
  document.getElementById('searchInput').oninput = applyFilter;
  document.getElementById('filterCategory').onchange = applyFilter;
  document.getElementById('filterType').onchange = applyFilter;
  document.getElementById('requestFoodForm').onsubmit = submitRequest;

  await loadDashboard();
});

async function loadDashboard() {
  const [donations, requests] = await Promise.all([API.get('donations'), API.get('requests')]);
  donationsCache = donations;

  const myRequests = requests.filter(r => String(r.ngoId) === String(currentUser.id));

  document.getElementById('stat-available-food').textContent = donations.filter(d => d.status === 'AVAILABLE').length;
  document.getElementById('stat-my-requests').textContent = myRequests.length;
  document.getElementById('stat-approved').textContent = myRequests.filter(r => r.status === 'APPROVED').length;
  document.getElementById('stat-rescued-count').textContent = myRequests.filter(r => r.status === 'COMPLETED').length;

  applyFilter();
  renderHistory(myRequests);
}

function applyFilter() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('filterCategory').value;
  const type = document.getElementById('filterType').value;

  const list = donationsCache.filter(d => {
    return d.status === 'AVAILABLE' &&
      (!category || d.category === category) &&
      (!type || d.foodType === type) &&
      (d.foodName.toLowerCase().includes(query) || d.restaurantName.toLowerCase().includes(query));
  });

  const grid = document.getElementById('availableFoodGrid');
  grid.replaceChildren();

  list.forEach(item => {
    const col = el('div', 'col-md-4');
    const card = el('div', 'card h-100');
    const body = el('div', 'card-body');

    const badge = el('span', `badge ${item.foodType === 'VEGETARIAN' ? 'bg-success' : 'bg-danger'} mb-2`, item.foodType);
    const title = el('h4', 'fw-bold mb-2', item.foodName);
    const place = el('p', 'text-muted small mb-2', `🏪 ${item.restaurantName} • 📍 ${item.location}`);
    const meta = el('p', 'small mb-3', `📦 ${item.quantity} ${item.unit} • Expires: ${item.expiry}`);
    const btn = el('button', 'btn btn-outline-success w-100', 'Request Food');
    btn.onclick = () => openRequestModal(item);

    body.append(badge, title, place, meta, btn);
    card.appendChild(body);
    col.appendChild(card);
    grid.appendChild(col);
  });
}

function openRequestModal(item) {
  document.getElementById('modalDonationId').value = item.id;
  document.getElementById('modalResName').textContent = item.restaurantName;
  document.getElementById('modalMaxQty').textContent = `${item.quantity} ${item.unit}`;
  document.getElementById('modalUnit').textContent = item.unit;
  document.getElementById('requestQty').max = item.quantity;
  document.getElementById('requestQty').value = item.quantity;
  document.getElementById('requestModal').classList.add('show');
}

function closeRequestModal() {
  document.getElementById('requestModal').classList.remove('show');
}

async function submitRequest(e) {
  e.preventDefault();
  const req = {
    donationId: document.getElementById('modalDonationId').value,
    ngoId: currentUser.id,
    ngoName: currentUser.orgName || currentUser.name,
    requestedQuantity: Number(document.getElementById('requestQty').value),
    message: document.getElementById('requestMsg').value,
    status: 'PENDING',
    createdAt: new Date().toLocaleDateString()
  };

  await API.post('requests', req);
  closeRequestModal();
  showToast('Request sent successfully!');
  loadDashboard();
}

function renderHistory(requests) {
  const tbody = document.getElementById('ngoRequestsTable');
  tbody.replaceChildren();

  requests.forEach(r => {
    const donation = donationsCache.find(d => String(d.id) === String(r.donationId));
    const tr = el('tr');

    const badge = el('span', `badge bg-${r.status === 'APPROVED' ? 'info' : r.status === 'COMPLETED' ? 'success' : 'warning'}`, r.status);
    const tdStatus = el('td');
    tdStatus.appendChild(badge);

    tr.append(
      el('td', 'fw-bold', donation ? donation.foodName : 'Deleted Item'),
      el('td', '', donation ? donation.restaurantName : 'N/A'),
      el('td', '', r.requestedQuantity),
      tdStatus,
      el('td', '', r.createdAt)
    );
    tbody.prepend(tr);
  });
}

function showTab(tabId, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('show'));
  document.querySelectorAll('.nav-link-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('show');
  btn.classList.add('active');
}