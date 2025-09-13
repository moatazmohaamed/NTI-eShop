document.addEventListener("DOMContentLoaded", () => {
    const productsContainer = document.getElementById("products-container");
    const noResultsElement = document.getElementById("no-results");
    const errorMessageElement = document.getElementById("error-message");
    const loadingElement = document.getElementById("loading");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const categoryFilter = document.getElementById("category-filter");
    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");
    const sortFilter = document.getElementById("sort-filter");
    const cartCount = document.getElementById('cart-count');
    const productsCountElement = document.getElementById('products-count');
    const wishlistCount = document.getElementById('wishlist-count');

    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col space-y-2';
        document.body.appendChild(toastContainer);
    }

    const API_URL = 'https://fakestoreapi.com';
    let allProducts = [];
    let filteredProducts = [];
    let categories = [];
    let currentPage = 1;
    const productsPerPage = 8;

    init();
    updateCartCount();
    updateWishlistCount();

    // Utility Functions
    async function fetchFromAPI(endpoint) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    function formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }

    function createStarRating(rating, maxRating = 5) {
        let starsHTML = '';
        const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

        for (let i = 1; i <= maxRating; i++) {
            if (i <= roundedRating) {
                // Full star
                starsHTML += `<svg class="w-4 h-4 star filled" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
            } else if (i - 0.5 <= roundedRating) {
                // Half star
                starsHTML += `<svg class="w-4 h-4 star filled" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clip-path="inset(0 50% 0 0)"></path></svg>`;
            } else {
                // Empty star
                starsHTML += `<svg class="w-4 h-4 star" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
            }
        }

        return starsHTML;
    }

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function getCartFromLocalStorage() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    function getWishlistFromLocalStorage() {
        const wishlist = localStorage.getItem('wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    }

    function saveWishlistToLocalStorage(wishlist) {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }

    function updateCartCount() {
        const cartItems = getCartFromLocalStorage();

        if (cartCount) {
            const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;

                    if (totalItems === 0) {
                cartCount.classList.add('hidden');
            } else {
                cartCount.classList.remove('hidden');
            }
        }
    }

    function updateWishlistCount() {
        const wishlistItems = getWishlistFromLocalStorage();

        if (wishlistCount) {
            const totalItems = wishlistItems.length;
            wishlistCount.textContent = totalItems;

            // Show/hide based on count
            if (totalItems === 0) {
                wishlistCount.classList.add('hidden');
            } else {
                wishlistCount.classList.remove('hidden');
            }
        }
    }

    function createPagination(currentPage, totalPages, onPageChange) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = `pagination-button ${currentPage === 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>`;
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                onPageChange(currentPage - 1);
            }
        });
        paginationContainer.appendChild(prevButton);

        // Page buttons
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                if (i !== currentPage) {
                    onPageChange(i);
                }
            });
            paginationContainer.appendChild(pageButton);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = `pagination-button ${currentPage === totalPages ? 'disabled' : ''}`;
        nextButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>`;
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    // Main Functions
    async function init() {
        try {
            // Show loading
            if (loadingElement) loadingElement.classList.remove('hidden');
            if (productsContainer) productsContainer.classList.add('hidden');
            if (noResultsElement) noResultsElement.classList.add('hidden');
            if (errorMessageElement) errorMessageElement.classList.add('hidden');

            allProducts = await fetchFromAPI("/products");
            filteredProducts = [...allProducts];
            categories = await fetchFromAPI("/products/categories");

            populateCategories();

            // Check for URL parameters
            checkURLParameters();

            renderProducts();
            setupEventListeners();

            // Hide loading
            if (loadingElement) loadingElement.classList.add('hidden');
            if (productsContainer) productsContainer.classList.remove('hidden');
        } catch (error) {
            console.error("Initialization error:", error);
            showError();
        }
    }

    function checkURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');

        if (categoryParam && categoryFilter) {
            categoryFilter.value = categoryParam;

            filterProducts();
        }
    }

    function populateCategories() {
        if (!categoryFilter) return;

        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryFilter.appendChild(option);
        });
    }

    function setupEventListeners() {
        if (searchButton) {
            searchButton.addEventListener("click", filterProducts);
        }

        if (searchInput) {
            searchInput.addEventListener("keyup", (e) => {
                if (e.key === "Enter") filterProducts();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener("change", filterProducts);
        }

        if (minPriceInput) {
            minPriceInput.addEventListener("input", filterProducts);
        }

        if (maxPriceInput) {
            maxPriceInput.addEventListener("input", filterProducts);
        }

        if (sortFilter) {
            sortFilter.addEventListener("change", filterProducts);
        }
    }

    function filterProducts() {
        const searchTerm = searchInput ? sanitizeInput(searchInput.value.toLowerCase()) : '';
        const category = categoryFilter ? categoryFilter.value : '';
        const minPrice = minPriceInput && minPriceInput.value ? parseFloat(minPriceInput.value) : 0;
        const maxPrice = maxPriceInput && maxPriceInput.value ?
            parseFloat(maxPriceInput.value) :
            Infinity;

        currentPage = 1;

        filteredProducts = allProducts.filter((product) => {
            const matchesSearch =
                searchTerm === "" ||
                product.title.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm);

            const matchesCategory = category === "" || product.category === category;

            const matchesPrice =
                product.price >= minPrice && product.price <= maxPrice;

            return matchesSearch && matchesCategory && matchesPrice;
        });

        sortProducts();

        renderProducts();
    }

    function sortProducts() {
        if (!sortFilter) return;

        const sortOption = sortFilter.value;

        switch (sortOption) {
            case "price-asc":
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case "rating-desc":
                filteredProducts.sort((a, b) => b.rating.rate - a.rating.rate);
                break;
            default:
                filteredProducts.sort((a, b) => a.id - b.id);
                break;
        }
    }

    function renderProducts() {
        if (!productsContainer) return;

        productsContainer.innerHTML = "";

        if (filteredProducts.length === 0) {
            if (noResultsElement) noResultsElement.classList.remove("hidden");
            if (productsContainer) productsContainer.classList.add("hidden");
            if (productsCountElement) productsCountElement.textContent = "Showing 0 products";
            return;
        } else {
            if (noResultsElement) noResultsElement.classList.add("hidden");
            if (productsContainer) productsContainer.classList.remove("hidden");
        }

        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = Math.min(
            startIndex + productsPerPage,
            filteredProducts.length
        );
        const currentProducts = filteredProducts.slice(startIndex, endIndex);

        if (productsCountElement) {
            productsCountElement.textContent = `Showing ${currentProducts.length} of ${filteredProducts.length} products`;
        }

        currentProducts.forEach((product) => {
            const productCard = createProductCard(product);
            productsContainer.appendChild(productCard);
        });

        createPagination(currentPage, totalPages, (page) => {
            currentPage = page;
            renderProducts();
            window.scrollTo({
                top: productsContainer.offsetTop - 100,
                behavior: "smooth",
            });
        });
    }


    function createProductCard(product) {
        const card = document.createElement("div");
        card.className =
            "product-card bg-white rounded-lg shadow-md overflow-hidden transition-all";

        const truncatedTitle = truncateText(product.title, 50);
        const truncatedDescription = truncateText(product.description, 100);

        // Check if product is in wishlist
        const wishlist = getWishlistFromLocalStorage();
        const isInWishlist = wishlist.some(item => item.id === product.id);
        const heartFill = isInWishlist ? 'currentColor' : 'none';
        const heartClass = isInWishlist ? 'text-red-500' : 'text-gray-400';

        card.innerHTML = `
        <a href="product.html?id=${product.id}" class="h-full"> 
            <div class="product-image-container relative">
                     <img src="${product.image}" alt="${product.title}" class="product-image">
                     
                     <button class="wishlist-btn absolute top-2 right-2 p-1 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all" data-id="${product.id}">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ${heartClass}" fill="${heartFill}" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                     </svg>
                     </button>
                     </div>
                     </a>
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <span class="category-badge">${product.category}</span>
                    <span class="price-badge">${formatPrice(product.price)}</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2" title="${product.title}">${truncatedTitle}</h3>
                <p class="text-gray-600 text-sm mb-3">${truncatedDescription}</p>
                <div class="flex justify-between items-center mb-2">
                    <div class="star-rating">
                        ${createStarRating(product.rating.rate)}
                        <span class="text-xs text-gray-500 ml-1">(${product.rating.count})</span>
                    </div>
                </div>
                <button class="add-to-cart-btn w-full bg-indigo-600 text-white text-sm px-3 py-1 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" data-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        `;

        // Add event listener for Add to Cart button
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => {
            addToCart(product);
        });

        // Add event listener for Wishlist button
        const wishlistBtn = card.querySelector('.wishlist-btn');
        wishlistBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent navigating to product page
            toggleWishlist(product);
        });

        return card;
    }

    function addToCart(product) {
        const cart = getCartFromLocalStorage();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
            showToast(`${truncateText(product.title, 20)} quantity increased to ${existingItem.quantity}`, 'success');
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                category: product.category,
                quantity: 1
            });
            showToast(`${truncateText(product.title, 20)} added to cart`, 'success');
        }

        saveCartToLocalStorage(cart);
        updateCartCount();
    }

    function saveCartToLocalStorage(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function toggleWishlist(product) {
        const wishlist = getWishlistFromLocalStorage();
        const existingIndex = wishlist.findIndex(item => item.id === product.id);

        if (existingIndex !== -1) {
            // Remove from wishlist
            wishlist.splice(existingIndex, 1);
            showToast(`${truncateText(product.title, 20)} removed from wishlist`, 'info');
        } else {
            // Add to wishlist
            wishlist.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                category: product.category
            });
            showToast(`${truncateText(product.title, 20)} added to wishlist`, 'success');
        }

        saveWishlistToLocalStorage(wishlist);
        updateWishlistCount();

        // Update UI for all instances of this product on the page
        document.querySelectorAll(`.wishlist-btn[data-id="${product.id}"]`).forEach(btn => {
            const heartIcon = btn.querySelector('svg');
            if (existingIndex !== -1) {
                // Was in wishlist, now removed
                heartIcon.setAttribute('fill', 'none');
                heartIcon.classList.remove('text-red-500');
                heartIcon.classList.add('text-gray-400');
            } else {
                // Was not in wishlist, now added
                heartIcon.setAttribute('fill', 'currentColor');
                heartIcon.classList.add('text-red-500');
                heartIcon.classList.remove('text-gray-400');
            }
        });
    }

    // Toast notification system
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        let bgColor, iconSvg;

        switch (type) {
            case 'success':
                bgColor = 'bg-green-500';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                break;
            case 'error':
                bgColor = 'bg-red-500';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
                break;
            case 'warning':
                bgColor = 'bg-yellow-500';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
                break;
            default: // info
                bgColor = 'bg-blue-500';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
        }

        toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300 translate-y-0 opacity-0`;
        toast.innerHTML = `
            <div class="flex-shrink-0">
                ${iconSvg}
            </div>
            <div class="flex-1">${message}</div>
        `;

        toastContainer.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-0');
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => {
                if (toast.parentNode === toastContainer) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    function showError() {
        if (loadingElement) loadingElement.classList.add("hidden");
        if (productsContainer) productsContainer.classList.add("hidden");
        if (noResultsElement) noResultsElement.classList.add("hidden");
        if (errorMessageElement) errorMessageElement.classList.remove("hidden");
    }
});