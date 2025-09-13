document.addEventListener('DOMContentLoaded', () => {
    const cartItems = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const orderConfirmation = document.getElementById('order-confirmation');
    const closeConfirmation = document.getElementById('close-confirmation');

    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col space-y-2';
        document.body.appendChild(toastContainer);
    }

    setupEventListeners();
    renderCart();
    updateCartCount();

    function formatPrice(price) {
        return `$${price.toFixed(2)}`;
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

    function setupEventListeners() {
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                const cart = getCartFromLocalStorage();
                if (cart.length === 0) return;

                saveCartToLocalStorage([]);

                if (orderConfirmation) {
                    orderConfirmation.classList.remove('hidden');
                }

                showToast('Order placed successfully!', 'success');

                renderCart();
                updateCartCount();
            });
        }

        if (closeConfirmation) {
            closeConfirmation.addEventListener('click', () => {
                if (orderConfirmation) {
                    orderConfirmation.classList.add('hidden');
                }
            });
        }
    }

    function renderCart() {
        const cart = getCartFromLocalStorage();

        if (cart.length === 0) {
            if (emptyCart) emptyCart.classList.remove('hidden');
            if (cartContent) cartContent.classList.add('hidden');
            return;
        } else {
            if (emptyCart) emptyCart.classList.add('hidden');
            if (cartContent) cartContent.classList.remove('hidden');
        }

        if (cartItems) {
            cartItems.innerHTML = '';

            cart.forEach((item) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'flex items-center py-4';
                cartItem.innerHTML = `
                    <div class="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-contain">
                    </div>
                    <div class="ml-4 flex-1">
                        <h3 class="text-sm font-medium text-gray-900">${truncateText(item.title, 40)}</h3>
                        <p class="mt-1 text-sm text-gray-500">${formatPrice(item.price)} each</p>
                        <div class="mt-2 flex items-center">
                            <button class="decrease-quantity text-gray-500 focus:outline-none" data-id="${item.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                                </svg>
                            </button>
                            <span class="mx-2 text-gray-700">${item.quantity}</span>
                            <button class="increase-quantity text-gray-500 focus:outline-none" data-id="${item.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="ml-4 flex-shrink-0">
                        <p class="text-sm font-medium text-gray-900">${formatPrice(item.price * item.quantity)}</p>
                        <button class="remove-item mt-2 text-sm text-red-600 hover:text-red-500" data-id="${item.id}">
                            Remove
                        </button>
                    </div>
                `;

                cartItems.appendChild(cartItem);
            });

            document.querySelectorAll('.decrease-quantity').forEach(button => {
                button.addEventListener('click', () => {
                    updateItemQuantity(button.dataset.id, -1);
                });
            });

            document.querySelectorAll('.increase-quantity').forEach(button => {
                button.addEventListener('click', () => {
                    updateItemQuantity(button.dataset.id, 1);
                });
            });

            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', () => {
                    removeItem(button.dataset.id);
                });
            });
        }

        updateCartSummary();
    }

    function updateItemQuantity(itemId, change) {
        const cart = getCartFromLocalStorage();
        const itemIndex = cart.findIndex(item => item.id.toString() === itemId.toString());

        if (itemIndex === -1) return;

        cart[itemIndex].quantity += change;

        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
            showToast('Item removed from cart', 'info');
        } else {
            showToast(`Quantity updated to ${cart[itemIndex].quantity}`, 'info');
        }

        saveCartToLocalStorage(cart);
        renderCart();
        updateCartCount();
    }

    function removeItem(itemId) {
        const cart = getCartFromLocalStorage();
        const itemToRemove = cart.find(item => item.id.toString() === itemId.toString());
        const updatedCart = cart.filter(item => item.id.toString() !== itemId.toString());

        saveCartToLocalStorage(updatedCart);
        renderCart();
        updateCartCount();

        if (itemToRemove) {
            showToast(`${truncateText(itemToRemove.title, 20)} removed from cart`, 'info');
        }
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

    function updateCartSummary() {
        const cart = getCartFromLocalStorage();
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

        if (cartSubtotal) cartSubtotal.textContent = formatPrice(subtotal);
        if (cartTotal) cartTotal.textContent = formatPrice(subtotal);
    }
});