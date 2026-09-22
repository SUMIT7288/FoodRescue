let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = checkAuth('RESTAURANT');
  if (!currentUser) return;

  document.getElementById('userDisplayName').textContent = `Welcome, ${currentUser.orgName || currentUser.name}`;
  document.getElementById('addFoodForm').onsubmit = createDonation;

  await loadDashboard();
});

async function loadDashboard() {
  const [donations, requests] = await Promise.all([API.get('donations'), API.get('requests')]);
  const myDonations = donations.filter(d => String(d.restaurantId) === String(currentUser.id));
  const myRequests = requests.filter(r => myDonations.some(d => String(d.id) === String(r.donationId)));

  document.getElementById('stat-total').textContent = myDonations.length;
  document.getElementById('stat-available').textContent = myDonations.filter(d => d.status === 'AVAILABLE').length;
  document.getElementById('stat-pending').textContent = myRequests.filter(r => r.status === 'PENDING').length;
  document.getElementById('stat-rescued').textContent = myDonations.filter(d => d.status === 'COMPLETED').length;

  renderDonations(myDonations);
  renderRequests(myRequests, myDonations);
}

function renderDonations(items) {
  const container = document.getElementById('donationsList');
  container.replaceChildren();

  items.forEach(d => {
    const col = el('div', 'col-md-4');
    const card = el('div', 'card h-100');
    const body = el('div', 'card-body');

    const top = el('div', 'd-flex justify-content-between mb-2');
    top.append(el('span', 'badge bg-secondary', d.category), el('span', 'badge bg-primary', d.status));

    const title = el('h4', 'fw-bold mb-2', d.foodName);
    const info = el('p', 'small text-muted mb-3', `Quantity: ${d.quantity} ${d.unit} • Location: ${d.location}`);

    const delBtn = el('button', 'btn btn-outline-danger btn-sm w-100', 'Delete');
    delBtn.onclick = async () => {
      if (confirm('Delete this food posting?')) {
        await API.delete('donations', d.id);
        loadDashboard();
      }
    };

    body.append(top, title, info, delBtn);
    card.appendChild(body);
    col.appendChild(card);
    container.appendChild(col);
  });
}

function renderRequests(requests, donations) {
  const tbody = document.getElementById('requestsTableBody');
  tbody.replaceChildren();

  requests.forEach(r => {
    const food = donations.find(d => String(d.id) === String(r.donationId));
    const tr = el('tr');
    const tdAction = el('td');

    if (r.status === 'PENDING') {
      const approveBtn = el('button', 'btn btn-success btn-sm me-2', 'Approve');
      approveBtn.onclick = async () => {
        await API.patch('requests', r.id, { status: 'APPROVED' });
        await API.patch('donations', r.donationId, { status: 'REQUESTED' });
        loadDashboard();
      };
      const rejectBtn = el('button', 'btn btn-danger btn-sm', 'Reject');
      rejectBtn.onclick = async () => {
        await API.patch('requests', r.id, { status: 'REJECTED' });
        loadDashboard();
      };
      tdAction.append(approveBtn, rejectBtn);
    } else if (r.status === 'APPROVED') {
      const finishBtn = el('button', 'btn btn-primary btn-sm', 'Mark Completed');
      finishBtn.onclick = async () => {
        await API.patch('requests', r.id, { status: 'COMPLETED' });
        await API.patch('donations', r.donationId, { status: 'COMPLETED' });
        loadDashboard();
      };
      tdAction.appendChild(finishBtn);
    } else {
      tdAction.textContent = '-';
    }

    tr.append(
      el('td', 'fw-bold', food ? food.foodName : 'Unknown'),
      el('td', '', r.ngoName),
      el('td', '', r.requestedQuantity),
      el('td', '', r.status),
      tdAction
    );
    tbody.appendChild(tr);
  });
}

async function createDonation(e) {
  e.preventDefault();
  const form = e.target;
  const newDonation = {
    restaurantId: currentUser.id,
    restaurantName: currentUser.orgName || currentUser.name,
    foodName: document.getElementById('foodName').value.trim(),
    category: document.getElementById('category').value,
    quantity: Number(document.getElementById('quantity').value),
    unit: document.getElementById('unit').value.trim(),
    foodType: document.getElementById('foodType').value,
    location: document.getElementById('location').value.trim(),
    expiry: document.getElementById('expiry').value.replace('T', ' '),
    status: 'AVAILABLE',
    createdAt: new Date().toISOString()
  };

  await API.post('donations', newDonation);
  form.reset();
  closeModal();
  showToast('Donation posted successfully!');
  loadDashboard();
}

function openModal() { document.getElementById('addFoodModal').classList.add('show'); }
function closeModal() { document.getElementById('addFoodModal').classList.remove('show'); }
function showTab(tabId, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('show'));
  document.querySelectorAll('.nav-link-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('show');
  btn.classList.add('active');
}