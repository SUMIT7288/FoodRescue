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
//js app