document.addEventListener("DOMContentLoaded", () => {
    const featuredProductsContainer = document.getElementById("featured-products");
    const featuredLoadingElement = document.getElementById("featured-loading");
    const featuredErrorElement = document.getElementById("featured-error");
    const categoriesContainer = document.getElementById("categories-container");
    const cartCount = document.getElementById('cart-count');
    const wishlistCount = document.getElementById('wishlist-count');



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
        const roundedRating = Math.round(rating * 2) / 2;

        for (let i = 1; i <= maxRating; i++) {
            if (i <= roundedRating) {

            } else if (i - 0.5 <= roundedRating) {

            } else {

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
            wishlist.splice(existingIndex, 1);
            showToast(`${truncateText(product.title, 20)} removed from wishlist`, 'info');
        } else {
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
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        let bgColor, iconSvg;

        switch (type) {
            case 'success':
                bgColor = 'bg-green-500';
                break;
            case 'error':
                bgColor = 'bg-red-500';
                break;
            case 'warning':
                bgColor = 'bg-yellow-500';
                break;
                bgColor = 'bg-blue-500';
        }

        toast.className = `${bgColor} text-white p-3 rounded-md shadow-md flex items-center mb-3 animate-fade-in`;
        toast.innerHTML = `
            <div class="mr-2">${iconSvg}</div>
            <div>${message}</div>
        `;

        toastContainer.appendChild(toast);

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
            await loadFeaturedProducts();

            await loadCategories();
        } catch (error) {
            console.error('Initialization error:', error);
            showFeaturedError();
        }
    }

    async function loadFeaturedProducts() {
        try {
            showFeaturedLoading();

            const products = await fetchFromAPI('/products');
            const featuredProducts = getRandomProducts(products, 4);

            renderFeaturedProducts(featuredProducts);
        } catch (error) {
            console.error('Error loading featured products:', error);
            showFeaturedError();
        }
    }

    function getRandomProducts(products, count) {
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

        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', (e) => {
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

    function showToast(message, type = 'info') {
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
                break;
            case 'error':
                bgColor = 'bg-red-500';
                break;
            case 'warning':
                bgColor = 'bg-yellow-500';
                break;
                bgColor = 'bg-blue-500';
        }

        toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300 translate-y-0 opacity-0`;
        toast.innerHTML = `
            <div class="flex-shrink-0">
                ${iconSvg}
            </div>
            <div class="flex-1">${message}</div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-0');
        }, 10);

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

        const displayName = category.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');

        card.innerHTML = `
            <a href="index.html?category=${category}" class="block p-6 text-center">
                <div class="text-indigo-600 mb-2">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                </div>
                <h3 class="font-medium text-gray-900">${displayName}</h3>
            </a>
        `;

        return card;
    }

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