const API_BASE = '/api/products';

async function loadProducts() {
  try {
    const res = await fetch(API_BASE);
    const products = await res.json();
    renderProducts(products);
  } catch (err) {
    console.error('Failed to load products', err);
  }
}

function renderProducts(products) {
  const grid = document.querySelector('.products-grid');
  grid.innerHTML = products.map(p => {
    // Determine category classes for filtering
    const categories = [];
    if (p.badge) categories.push(p.badge);
    if (p.isBestSeller) categories.push('best');
    const categoryStr = categories.join(' ') || 'all';

    return `
      <div class="product-card" data-category="${categoryStr}">
        <div class="product-image-container">
          <img src="${p.imageUrl}" alt="${p.name}" class="product-image">
        </div>
        <div class="product-info">
          <div class="product-category">${p.category}</div>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.description || ''}</p>
          <div class="product-actions">
            <div class="product-price">${p.price}</div>
            <a href="#product-${p._id}" class="btn btn-primary btn-small">View Details</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Re-attach filter functionality (if using filter buttons)
  attachFilters();
}

function attachFilters() {
  // Your existing filter logic, but now works on dynamically added cards
}

loadProducts();