if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
  // Skip auth check on login/register pages
} else {
  if (!localStorage.getItem('loggedInUser')) {
    window.location.href = 'login.html';
  }
}

// Register user
const regForm = document.getElementById('registerForm');
if (regForm) {
  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.username === username)) {
      alert('Username already exists!');
      return;
    }
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
  });
}

// Login user
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem('loggedInUser', username);
      alert('Login successful!');
      window.location.href = 'index.html';
    } else {
      alert('Invalid credentials!');
    }
  });
}

// Logout function
function logout() {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'login.html';
}
