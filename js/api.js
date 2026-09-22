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