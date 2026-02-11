let token = localStorage.getItem('token');
const API_PRODUCTS = '/api/products';
const API_LOGIN = '/api/auth/login';

// ---- Login ----
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  try {
    const res = await fetch(API_LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      token = data.token;
      localStorage.setItem('token', token);
      showAdminPanel();
    } else {
      document.getElementById('loginError').innerText = data.error || 'Login failed';
    }
  } catch (err) {
    document.getElementById('loginError').innerText = 'Network error';
  }
});

// ---- Logout ----
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  token = null;
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
});

// ---- Check token on load ----
async function showAdminPanel() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  await loadProductsTable();
}

// ---- Fetch all products (with auth) ----
async function loadProductsTable() {
  const res = await fetch(API_PRODUCTS, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const products = await res.json();
  const tbody = document.querySelector('#productTable tbody');
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.imageUrl}" alt="${p.name}"></td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.price}</td>
      <td>${p.badge || ''}</td>
      <td>${p.isBestSeller ? '✅' : ''}</td>
      <td>
        <button onclick="editProduct('${p._id}')">Edit</button>
        <button onclick="deleteProduct('${p._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// ---- Edit - populate form ----
window.editProduct = async function(id) {
  const res = await fetch(`${API_PRODUCTS}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const p = await res.json();
  document.getElementById('productId').value = p._id;
  document.getElementById('name').value = p.name;
  document.getElementById('category').value = p.category;
  document.getElementById('description').value = p.description || '';
  document.getElementById('price').value = p.price;
  document.getElementById('imageUrl').value = p.imageUrl;
  document.getElementById('badge').value = p.badge || '';
  document.getElementById('isBestSeller').checked = p.isBestSeller || false;
};

// ---- Delete ----
window.deleteProduct = async function(id) {
  if (!confirm('Delete product?')) return;
  await fetch(`${API_PRODUCTS}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  await loadProductsTable();
};

// ---- Save (Create/Update) ----
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const productData = {
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    description: document.getElementById('description').value,
    price: document.getElementById('price').value,
    imageUrl: document.getElementById('imageUrl').value,
    badge: document.getElementById('badge').value,
    isBestSeller: document.getElementById('isBestSeller').checked
  };

  const url = id ? `${API_PRODUCTS}/${id}` : API_PRODUCTS;
  const method = id ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });

  resetForm();
  await loadProductsTable();
});

document.getElementById('cancelEdit').addEventListener('click', resetForm);
function resetForm() {
  document.getElementById('productId').value = '';
  document.getElementById('productForm').reset();
}

// Initial check: if token exists, show admin panel
if (token) showAdminPanel();