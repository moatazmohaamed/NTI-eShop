document.addEventListener('DOMContentLoaded', () => {
    const wishlistItems = document.getElementById('wishlist-items');
    const emptyWishlist = document.getElementById('empty-wishlist');
    const wishlistContent = document.getElementById('wishlist-content');

    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col space-y-2';
        document.body.appendChild(toastContainer);
    }

    setupEventListeners();
    renderWishlist();
    updateWishlistCount();

    function formatPrice(price) {
        return `$${price.toFixed(2)}`;
    }

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
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

    function setupEventListeners() {
        if (wishlistItems) {
            wishlistItems.addEventListener('click', (e) => {
                const target = e.target;

                if (target.classList.contains('remove-from-wishlist') ||
                    target.closest('.remove-from-wishlist')) {
                    const button = target.classList.contains('remove-from-wishlist') ?
                        target : target.closest('.remove-from-wishlist');
                    const itemId = button.dataset.id;
                    removeFromWishlist(itemId);
                }

                if (target.classList.contains('add-to-cart-from-wishlist') ||
                    target.closest('.add-to-cart-from-wishlist')) {
                    const button = target.classList.contains('add-to-cart-from-wishlist') ?
                        target : target.closest('.add-to-cart-from-wishlist');
                    const itemId = button.dataset.id;
                    addToCartFromWishlist(itemId);
                }
            });
        }
    }

    function renderWishlist() {
        const wishlist = getWishlistFromLocalStorage();

        if (wishlist.length === 0) {
            if (emptyWishlist) emptyWishlist.classList.remove('hidden');
            if (wishlistContent) wishlistContent.classList.add('hidden');
            return;
        } else {
            if (emptyWishlist) emptyWishlist.classList.add('hidden');
            if (wishlistContent) wishlistContent.classList.remove('hidden');
        }

        if (wishlistItems) {
            wishlistItems.innerHTML = '';

            wishlist.forEach((item) => {
                const wishlistItem = document.createElement('div');
                wishlistItem.className = 'flex items-center py-4 border-b border-gray-200 last:border-b-0';
                wishlistItem.innerHTML = `
                    <div class="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-contain">
                    </div>
                    <div class="ml-4 flex-1">
                        <div class="flex justify-between">
                            <h3 class="text-sm font-medium text-gray-900">${truncateText(item.title, 40)}</h3>
                            <button class="remove-from-wishlist text-gray-400 hover:text-red-500" data-id="${item.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>
                        <p class="mt-1 text-sm text-gray-500">${formatPrice(item.price)}</p>
                        <div class="mt-2">
                            <a href="product.html?id=${item.id}" class="text-sm text-indigo-600 hover:text-indigo-500">View Details</a>
                            <button class="add-to-cart-from-wishlist ml-4 text-sm text-indigo-600 hover:text-indigo-500" data-id="${item.id}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                `;
                wishlistItems.appendChild(wishlistItem);
            });
        }
    }

    function removeFromWishlist(itemId) {
        const wishlist = getWishlistFromLocalStorage();
        const itemToRemove = wishlist.find(item => item.id.toString() === itemId.toString());
        const updatedWishlist = wishlist.filter(item => item.id.toString() !== itemId.toString());

        saveWishlistToLocalStorage(updatedWishlist);
        renderWishlist();
        updateWishlistCount();

        if (itemToRemove) {
            showToast(`${truncateText(itemToRemove.title, 20)} removed from wishlist`, 'info');
        }
    }

    function addToCartFromWishlist(itemId) {
        const wishlist = getWishlistFromLocalStorage();
        const item = wishlist.find(item => item.id.toString() === itemId.toString());

        if (!item) return;

        const cart = getCartFromLocalStorage();
        const existingCartItem = cart.find(cartItem => cartItem.id.toString() === itemId.toString());

        if (existingCartItem) {
            existingCartItem.quantity += 1;
            showToast(`${truncateText(item.title, 20)} quantity increased in cart`, 'success');
        } else {
            cart.push({
                id: item.id,
                title: item.title,
                price: item.price,
                image: item.image,
                category: item.category || '',
                quantity: 1
            });
            showToast(`${truncateText(item.title, 20)} added to cart`, 'success');
        }

        saveCartToLocalStorage(cart);
        updateCartCount();

        removeFromWishlist(itemId);
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

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        let bgColor, iconSvg;

        switch (type) {
            case 'success':
                bgColor = 'bg-green-500';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                break;
            case 'error':
                bgColor = 'bg-red-500';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
                break;
            case 'warning':
                bgColor = 'bg-yellow-500';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
                break;
            default:
                bgColor = 'bg-blue-500';
                iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
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
});