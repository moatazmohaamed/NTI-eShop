document.addEventListener("DOMContentLoaded", () => {
    const featuredProductsContainer = document.getElementById("featured-products");
    const featuredLoadingElement = document.getElementById("featured-loading");
    const featuredErrorElement = document.getElementById("featured-error");
    const categoriesContainer = document.getElementById("categories-container");
    const cartCount = document.getElementById('cart-count');
    const wishlistCount = document.getElementById('wishlist-count');


    const API_URL = 'https://fakestoreapi.com';

    init();
    updateCartCount();
    updateWishlistCount();

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

    function getCartFromLocalStorage() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    function saveCartToLocalStorage(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const cartItems = getCartFromLocalStorage();

        if (cartCount) {
            const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;

            // Show/hide based on count
            if (totalItems === 0) {
                cartCount.classList.add('hidden');
            } else {
                cartCount.classList.remove('hidden');
            }
        }
    }

    function getWishlistFromLocalStorage() {
        const wishlist = localStorage.getItem('wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    }

    function saveWishlistToLocalStorage(wishlist) {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
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
                category: product.category || ''
            });
            showToast(`${truncateText(product.title, 20)} added to wishlist`, 'success');
        }

        saveWishlistToLocalStorage(wishlist);
        updateWishlistCount();
        return existingIndex === -1; // Return true if added, false if removed
    }

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

        toast.className = `${bgColor} text-white p-3 rounded-md shadow-md flex items-center mb-3 animate-fade-in`;
        toast.innerHTML = `
            <div class="mr-2">${iconSvg}</div>
            <div>${message}</div>
        `;

        toastContainer.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('animate-fade-out');
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    async function init() {
        try {
            // Fetch featured products (limited to 4)
            await loadFeaturedProducts();

            // Fetch categories
            await loadCategories();
        } catch (error) {
            console.error('Initialization error:', error);
            showFeaturedError();
        }
    }

    async function loadFeaturedProducts() {
        try {
            showFeaturedLoading();

            // Fetch all products and select 4 random ones
            const products = await fetchFromAPI('/products');
            const featuredProducts = getRandomProducts(products, 4);

            renderFeaturedProducts(featuredProducts);
        } catch (error) {
            console.error('Error loading featured products:', error);
            showFeaturedError();
        }
    }

    function getRandomProducts(products, count) {
        // Shuffle array and get first 'count' items
        return [...products]
            .sort(() => 0.5 - Math.random())
            .slice(0, count);
    }

    function renderFeaturedProducts(products) {
        hideFeaturedLoading();
        hideFeaturedError();

        if (!featuredProductsContainer) return;

        featuredProductsContainer.innerHTML = '';

        products.forEach(product => {
            const productCard = createProductCard(product);
            featuredProductsContainer.appendChild(productCard);
        });
    }

    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300';
        card.dataset.id = product.id;

        card.innerHTML = `
            <a href="product.html?id=${product.id}" class="block">
                <div class="h-48 p-4 flex items-center justify-center bg-gray-100">
                    <img src="${product.image}" alt="${product.title}" class="h-full object-contain">
                </div>
                <div class="p-4">
                    <h3 class="text-sm font-medium text-gray-900 mb-1">${truncateText(product.title, 40)}</h3>
                    <p class="text-gray-500 text-sm mb-2">${product.category}</p>
                    <div class="flex items-center mb-2">
                        <div class="flex text-yellow-400 mr-1">
                            ${createStarRating(product.rating.rate)}
                        </div>
                        <span class="text-xs text-gray-500">(${product.rating.count})</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-900 font-medium">${formatPrice(product.price)}</span>
                        <button class="add-to-cart-btn bg-indigo-600 text-white text-xs px-3 py-1 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" data-id="${product.id}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </a>
        `;

        // Add event listener for Add to Cart button
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent navigating to product page
            addToCart(product);
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

    // Toast notification system
    function showToast(message, type = 'info') {
        // Check if toast container exists, if not create it
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col space-y-2';
            document.body.appendChild(toastContainer);
        }

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

    async function loadCategories() {
        try {
            if (!categoriesContainer) return;

            const categories = await fetchFromAPI('/products/categories');
            renderCategories(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    function renderCategories(categories) {
        if (!categoriesContainer) return;

        categoriesContainer.innerHTML = '';

        categories.forEach(category => {
            const categoryCard = createCategoryCard(category);
            categoriesContainer.appendChild(categoryCard);
        });
    }

    function createCategoryCard(category) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300';

        // Format category name for display
        const displayName = category.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        card.innerHTML = `
            <a href="index.html?category=${category}" class="block p-6 text-center">
                <div class="text-indigo-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                </div>
                <h3 class="font-medium text-gray-900">${displayName}</h3>
            </a>
        `;

        return card;
    }

    // Loading and error state functions
    function showFeaturedLoading() {
        if (featuredLoadingElement) featuredLoadingElement.classList.remove('hidden');
        if (featuredProductsContainer) featuredProductsContainer.classList.add('hidden');
        if (featuredErrorElement) featuredErrorElement.classList.add('hidden');
    }

    function hideFeaturedLoading() {
        if (featuredLoadingElement) featuredLoadingElement.classList.add('hidden');
        if (featuredProductsContainer) featuredProductsContainer.classList.remove('hidden');
    }

    function showFeaturedError() {
        if (featuredLoadingElement) featuredLoadingElement.classList.add('hidden');
        if (featuredProductsContainer) featuredProductsContainer.classList.add('hidden');
        if (featuredErrorElement) featuredErrorElement.classList.remove('hidden');
    }

    function hideFeaturedError() {
        if (featuredErrorElement) featuredErrorElement.classList.add('hidden');
    }
});