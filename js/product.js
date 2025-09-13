document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
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

    // Product details elements
    const productImage = document.getElementById('product-image');
    const productName = document.getElementById('product-name');
    const productRating = document.getElementById('product-rating');
    const productReviewCount = document.getElementById('product-review-count');
    const productPrice = document.getElementById('product-price');
    const productDescription = document.getElementById('product-description');
    const productCategory = document.getElementById('product-category');
    const productTitle = document.getElementById('product-title');

    // Quantity controls
    const decreaseQuantityBtn = document.getElementById('decrease-quantity');
    const increaseQuantityBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('quantity');
    const addToCartBtn = document.getElementById('add-to-cart');
    const addToWishlistBtn = document.getElementById('add-to-wishlist');

    const API_URL = 'https://fakestoreapi.com';
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
            if (i <= roundedRating) {
                starsHTML += `<svg class="w-4 h-4 star filled" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
            } else if (i - 0.5 <= roundedRating) {
                starsHTML += `<svg class="w-4 h-4 star filled" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clip-path="inset(0 50% 0 0)"></path></svg>`;
            } else {
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
        const cartCount = document.getElementById('cart-count');

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
        const wishlistCount = document.getElementById('wishlist-count');

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

    // Main Functions
    async function init() {
        if (!productId) {
            showError('Product ID is missing');
            return;
        }

        try {
            // Fetch product details
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
        // Hide loading, show content
        productLoading.classList.add('hidden');
        productContent.classList.remove('hidden');

        // Set page title
        document.title = `${product.title} | eShop`;

        // Update product details
        productImage.src = product.image;
        productImage.alt = product.title;
        productName.textContent = product.title;
        productRating.innerHTML = createStarRating(product.rating.rate);
        productReviewCount.textContent = `(${product.rating.count} reviews)`;
        productPrice.textContent = formatPrice(product.price);
        productDescription.textContent = product.description;

        // Update breadcrumb
        productCategory.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
        productCategory.href = `index.html?category=${product.category}`;
        productTitle.textContent = truncateText(product.title, 30);

        // Update wishlist button state
        if (addToWishlistBtn) {
            const wishlist = getWishlistFromLocalStorage();
            const isInWishlist = wishlist.some(item => item.id === product.id);
            updateWishlistButtonState(isInWishlist);
        }
    }

    function setupEventListeners(product) {
        // Quantity controls
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

        // Prevent manual input of invalid values
        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value);
            if (isNaN(value) || value < 1) {
                value = 1;
            }
            quantityInput.value = value;
        });

        // Add to cart button
        addToCartBtn.addEventListener('click', () => {
            addToCart(product);
        });

        // Add to wishlist button
        if (addToWishlistBtn) {
            // Set initial state
            const wishlist = getWishlistFromLocalStorage();
            const isInWishlist = wishlist.some(item => item.id === product.id);
            updateWishlistButtonState(isInWishlist);

            // Add event listener
            addToWishlistBtn.addEventListener('click', () => {
                toggleWishlist(product);
            });
        }
    }

    function addToCart(product) {
        const quantity = parseInt(quantityInput.value);

        // Get current cart
        const cart = getCartFromLocalStorage();

        // Check if product already in cart
        const existingItemIndex = cart.findIndex(item => item.id === product.id);

        if (existingItemIndex !== -1) {
            // Update quantity if product already in cart
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item to cart
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }

        // Save updated cart
        saveCartToLocalStorage(cart);
        updateCartCount();

        // Change button text to "Added"
        const cartIcon = addToCartBtn.querySelector('svg').cloneNode(true);
        addToCartBtn.innerHTML = '';
        addToCartBtn.appendChild(cartIcon);
        addToCartBtn.appendChild(document.createTextNode(' Added'));

        // Reset button text after 2 seconds
        setTimeout(() => {
            addToCartBtn.innerHTML = '';
            addToCartBtn.appendChild(cartIcon);
            addToCartBtn.appendChild(document.createTextNode(' Add to Cart'));
        }, 2000);

        // Show success message
        showAddedToCartMessage();
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
            default:
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

    function showAddedToCartMessage() {
        showToast('Added to cart!', 'success');
    }

    function toggleWishlist(product) {
        const wishlist = getWishlistFromLocalStorage();
        const existingIndex = wishlist.findIndex(item => item.id === product.id);

        if (existingIndex !== -1) {
            // Remove from wishlist
            wishlist.splice(existingIndex, 1);
            showToast(`${truncateText(product.title, 20)} removed from wishlist`, 'info');
            updateWishlistButtonState(false);
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
            updateWishlistButtonState(true);
        }

        saveWishlistToLocalStorage(wishlist);
        updateWishlistCount();
    }

    function updateWishlistButtonState(isInWishlist) {
        const addToWishlistBtn = document.getElementById('add-to-wishlist');
        if (!addToWishlistBtn) return;

        const heartIcon = addToWishlistBtn.querySelector('svg');

        // Clear existing text content (excluding the SVG)
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

            // Add text after the SVG
            const textNode = document.createTextNode(' Remove from Wishlist');
            addToWishlistBtn.appendChild(textNode);
        } else {
            addToWishlistBtn.classList.remove('active');
            if (heartIcon) {
                heartIcon.setAttribute('fill', 'none');
                heartIcon.classList.remove('text-red-500');
            }
            addToWishlistBtn.setAttribute('title', 'Add to wishlist');

            // Add text after the SVG
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