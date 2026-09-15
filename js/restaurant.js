let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = checkAuth('RESTAURANT');
  if (!currentUser) return;

  document.getElementById('userDisplayName').textContent = Welcome, ${currentUser.orgName || currentUser.name};
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
  container.replaceChildren();}
