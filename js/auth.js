function getSession() {
  return JSON.parse(localStorage.getItem('foodrescue_session'));
}

function checkAuth(role) {
  const user = getSession();
  if (!user || (role && user.role !== role)) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function logout() {
  localStorage.removeItem('foodrescue_session');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const role = document.getElementById('loginRole').value;

      try {
        const users = await API.get('users');
        const user = users.find(u => u.email === email && u.password === password && u.role === role);

        if (user) {
          localStorage.setItem('foodrescue_session', JSON.stringify(user));
          if (user.role === 'RESTAURANT') window.location.href = 'restaurant.html';
          else if (user.role === 'NGO') window.location.href = 'ngo.html';
          else if (user.role === 'ADMIN') window.location.href = 'admin.html';
        } else {
          alert('Invalid credentials!');
        }
      } catch {
        alert('Server unreachable. Start json-server.');
      }
    };
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();
      const password = document.getElementById('regPass').value;
      const confirm = document.getElementById('regConfirmPass').value;
      if (password !== confirm) return alert('Passwords do not match');

      const email = document.getElementById('regEmail').value.trim();
      const users = await API.get('users');
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return alert('Email already registered');
      }

      const newUser = {
        name: document.getElementById('regName').value.trim(),
        orgName: document.getElementById('regOrg').value.trim(),
        email: email,
        phone: document.getElementById('regPhone').value.trim(),
        password: password,
        role: document.querySelector('input[name="role"]:checked').value
      };

      await API.post('users', newUser);
      alert('Registration successful! Please login.');
      window.location.href = 'login.html';
    };
  }
});