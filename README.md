# eCommerce Website

A simple, responsive eCommerce web application built using **HTML**, **JavaScript**, and **Tailwind CSS**. The project integrates with the [Fake Store API](https://fakestoreapi.com/) to display and manage products dynamically.

## Features

### Product Search
- Search for products by keywords
- Instant filtering of displayed products without page reloads

### Product Filtering
- Filter products by price range
- Filter by categories provided by the Fake Store API

### Product Sorting
- Sort products by:
  - Relevance (default API order)
  - Price (low to high, high to low)
  - Rating (highest rated first)

### Product Pagination
- Displays products in multiple pages for better usability
- Adjustable items per page for user preference

### Responsive Design
- Built with Tailwind CSS utility classes
- Optimized for mobile, tablet, and desktop

### Accessibility
- Semantic HTML used for screen readers
- Color contrast checked for readability
- Keyboard navigable interface

### Error Handling
- Graceful handling of API failures
- Error messages shown when products cannot be loaded

### Security Considerations
- Sanitized input for search and filters
- Local storage handling for cart with simple checks
- No sensitive user data stored or transmitted

## Project Structure

```
├── /pages
│   ├── index.html         # Home page
│   ├── product.html       # Product details page
│   └── cart.html          # Shopping cart page
├── /css
│   └── styles.css         # Custom styles on top of Tailwind CSS
├── /js
│   ├── app.js             # Main script (fetch + render products)
│   ├── cart.js            # Cart logic
│   ├── product.js         # Product details logic
│   └── utils.js           # Shared helpers (filters, sorting, error handling)
└── README.md
```

## How to Run

1. Clone the repository
2. Open the project in your favorite code editor
3. Open `pages/index.html` in your web browser

No build process is required as the project uses CDN for Tailwind CSS.

## API Integration

This project uses the [Fake Store API](https://fakestoreapi.com/) to fetch product data. The API provides endpoints for:

- Getting all products
- Getting a single product by ID
- Getting all categories
- Filtering products by category

## Future Improvements

- Add user authentication
- Implement a wishlist feature
- Add product reviews
- Implement a real checkout process
- Add product recommendations

## Credits

- [Fake Store API](https://fakestoreapi.com/) for providing the product data
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework