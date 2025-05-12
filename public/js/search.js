document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
  
    input.addEventListener('input', async () => {
      const query = input.value.trim();
      results.innerHTML = '';
  
      if (query.length === 0) return;
  
      const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
      const products = await res.json();
  
      if (products.length > 0) {
        products.forEach(product => {
          const item = document.createElement('div');
          item.classList.add('search-result');
          item.textContent = product.title;
          item.onclick = () => {
            window.location.href = `/products/${product._id}`;
          };
          results.appendChild(item);
        });
      } else {
        results.innerHTML = '<div class="search-result">No products found</div>';
      }
    });
  });
  