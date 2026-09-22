<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [donations, users] = await Promise.all([API.get('donations'), API.get('users')]);

    const rescued = donations
      .filter(d => d.status === 'COMPLETED')
      .reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);

    const setVal = (id, val) => {
      const node = document.getElementById(id);
      if (node) node.textContent = val;
    };

    setVal('stat-donations', donations.length + '+');
    setVal('stat-meals', rescued + '+');
    setVal('stat-restaurants', users.filter(u => u.role === 'RESTAURANT').length);
    setVal('stat-ngos', users.filter(u => u.role === 'NGO').length);

    const container = document.getElementById('featured-food-container');
    if (!container) return;
    container.replaceChildren();

    const available = donations.filter(d => d.status === 'AVAILABLE').slice(0, 3);
    if (!available.length) {
      container.append(el('p', 'text-center text-muted col-12', 'No food available currently.'));
      return;
    }

    available.forEach(food => {
      const col = el('div', 'col-md-4');
      const card = el('div', 'card h-100');
      const body = el('div', 'card-body');

      const badge = el('span', `badge ${food.foodType === 'VEGETARIAN' ? 'bg-success' : 'bg-danger'} mb-2`, food.foodType);
      const title = el('h4', 'fw-bold mb-2', food.foodName);
      const place = el('p', 'text-muted small mb-2', `🏪 ${food.restaurantName}`);
      const info = el('p', 'small mb-3', `Quantity: ${food.quantity} ${food.unit} • Location: ${food.location}`);
      const btn = el('a', 'btn btn-outline-success w-100', 'Request Food');
      btn.href = 'login.html';

      body.append(badge, title, place, info, btn);
      card.appendChild(body);
      col.appendChild(card);
      container.appendChild(col);
    });
  } catch (err) {
    console.error('Data error:', err);
  }
});
=======
const API_URL = 'http://localhost:3000';

const API = {
  async get(resource) {
    const res = await fetch(`${API_URL}/${resource}`);
    return res.json();
  },
  async post(resource, data) {
    const res = await fetch(`${API_URL}/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async patch(resource, id, data) {
    const res = await fetch(`${API_URL}/${resource}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async delete(resource, id) {
    return fetch(`${API_URL}/${resource}/${id}`, { method: 'DELETE' });
  }
};

function el(tag, className = '', textContent = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

function showToast(message, type = 'success') {
  const container = document.querySelector('.toast-container');
  if (!container) return alert(message);
  const toast = el('div', `toast toast-${type}`, message);
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
>>>>>>> 29d8a1920055c5f509e25144f83df039b8983e9c
