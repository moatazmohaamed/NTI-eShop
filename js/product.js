document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://fakestoreapi.com';

    const productLoading = document.getElementById('product-loading');
    const productContent = document.getElementById('product-content');
    const productError = document.getElementById('product-error');

    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col space-y-2';
        document.body.appendChild(toastContainer);
    }


    const productImage = document.getElementById('product-image');
    const productName = document.getElementById('product-name');
    const productRating = document.getElementById('product-rating');
    const productReviewCount = document.getElementById('product-review-count');
    const productPrice = document.getElementById('product-price');
    const productDescription = document.getElementById('product-description');
    const productCategory = document.getElementById('product-category');
    const productTitle = document.getElementById('product-title');


    const decreaseQuantityBtn = document.getElementById('decrease-quantity');
    const increaseQuantityBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('quantity');
    const addToCartBtn = document.getElementById('add-to-cart');
    const addToWishlistBtn = document.getElementById('add-to-wishlist');

    const productId = getURLParameter('id');
    init();
    updateCartCount();

    function getURLParameter(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

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
            if (i <= roundedRating) {} else if (i - 0.5 <= roundedRating) {} else {}
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
        const cartCount = document.getElementById('cart-count');

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
        const wishlistCount = document.getElementById('wishlist-count');

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

    async function init() {
        if (!productId) {
            showError('Product ID is missing');
            return;
        }

        try {
            const product = await fetchFromAPI(`/products/${productId}`);
            renderProduct(product);
            setupEventListeners(product);
            updateWishlistCount();
        } catch (error) {
            console.error('Error fetching product:', error);
            showError('Failed to load product details');
        }
    }

    function renderProduct(product) {
        productLoading.classList.add('hidden');
        productContent.classList.remove('hidden');

        document.title = `${product.title} | eShop`;

        productImage.src = product.image;
        productImage.alt = product.title;
        productName.textContent = product.title;
        productRating.innerHTML = createStarRating(product.rating.rate);
        productReviewCount.textContent = `(${product.rating.count} reviews)`;
        productPrice.textContent = formatPrice(product.price);
        productDescription.textContent = product.description;

        productCategory.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
        productCategory.href = `index.html?category=${product.category}`;
        productTitle.textContent = truncateText(product.title, 30);

        if (addToWishlistBtn) {
            const wishlist = getWishlistFromLocalStorage();
            const isInWishlist = wishlist.some(item => item.id === product.id);
            updateWishlistButtonState(isInWishlist);
        }
    }

    function setupEventListeners(product) {
        decreaseQuantityBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        increaseQuantityBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });

        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value);
            if (isNaN(value) || value < 1) {
                value = 1;
            }
            quantityInput.value = value;
        });

        addToCartBtn.addEventListener('click', () => {
            addToCart(product);
        });

        if (addToWishlistBtn) {
            const wishlist = getWishlistFromLocalStorage();
            const isInWishlist = wishlist.some(item => item.id === product.id);
            updateWishlistButtonState(isInWishlist);

            addToWishlistBtn.addEventListener('click', () => {
                toggleWishlist(product);
            });
        }
    }

    function addToCart(product) {
        const quantity = parseInt(quantityInput.value);

        const cart = getCartFromLocalStorage();

        const existingItemIndex = cart.findIndex(item => item.id === product.id);

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }

        saveCartToLocalStorage(cart);
        updateCartCount();

        const cartIcon = addToCartBtn.querySelector('svg').cloneNode(true);
        addToCartBtn.innerHTML = '';
        addToCartBtn.appendChild(cartIcon);
        addToCartBtn.appendChild(document.createTextNode(' Added'));

        setTimeout(() => {
            addToCartBtn.innerHTML = '';
            addToCartBtn.appendChild(cartIcon);
            addToCartBtn.appendChild(document.createTextNode(' Add to Cart'));
        }, 2000);

        showAddedToCartMessage();
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        let bgColor;

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


    function showAddedToCartMessage() {
        showToast('Product added to cart!', 'success');
    }

    function toggleWishlist(product) {
        const wishlist = getWishlistFromLocalStorage();
        const existingIndex = wishlist.findIndex(item => item.id === product.id);

        if (existingIndex !== -1) {
            wishlist.splice(existingIndex, 1);
            showToast(`${truncateText(product.title, 20)} removed from wishlist`, 'info');
            updateWishlistButtonState(false);
        } else {
            wishlist.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                category: product.category || ''
            });
            showToast(`${truncateText(product.title, 20)} added to wishlist`, 'success');
            updateWishlistButtonState(true);
        }

        saveWishlistToLocalStorage(wishlist);
        updateWishlistCount();
    }

    function updateWishlistButtonState(isInWishlist) {
        const addToWishlistBtn = document.getElementById('add-to-wishlist');
        if (!addToWishlistBtn) return;

        const heartIcon = addToWishlistBtn.querySelector('svg');

        const buttonText = addToWishlistBtn.childNodes;
        buttonText.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = '';
            }
        });

        if (isInWishlist) {
            addToWishlistBtn.classList.add('active');
            if (heartIcon) {
                heartIcon.setAttribute('fill', 'currentColor');
                heartIcon.classList.add('text-red-500');
            }
            addToWishlistBtn.setAttribute('title', 'Remove from wishlist');

            const textNode = document.createTextNode(' Remove from Wishlist');
            addToWishlistBtn.appendChild(textNode);
        } else {
            addToWishlistBtn.classList.remove('active');
            if (heartIcon) {
                heartIcon.setAttribute('fill', 'none');
                heartIcon.classList.remove('text-red-500');
            }
            addToWishlistBtn.setAttribute('title', 'Add to wishlist');

            const textNode = document.createTextNode(' Add to Wishlist');
            addToWishlistBtn.appendChild(textNode);
        }
    }

    function showError(message) {
        productLoading.classList.add('hidden');
        productContent.classList.add('hidden');
        productError.classList.remove('hidden');

        const errorMessage = productError.querySelector('p');
        if (errorMessage && message) {
            errorMessage.textContent = message;
        }
    }
});