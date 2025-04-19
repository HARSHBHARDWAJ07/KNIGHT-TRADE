import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductDisplay.css';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const ProductDisplay = ({ Username }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products`, {
          withCredentials: true,
        });
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToWishlist = async (selectedProduct) => {
    // Check if user details exist in localStorage (authentication check)
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert("You must be logged in to add items to your wishlist.");
      navigate('/login');
      return;
    }

    // Parse user details from localStorage
    let user;
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      alert("User data is corrupted, please log in again.");
      navigate('/login');
      return;
    }

    // Use either user.user_id or user.id as needed by your backend
    const user_id = user.user_id || user.id;
    if (!user_id) {
      alert("User ID not found. Please log in again.");
      navigate('/login');
      return;
    }

    // Use product.id if it exists, otherwise fall back to product._id
    const product_id = selectedProduct.id || selectedProduct._id;
    if (!product_id) {
      alert("Product ID not found.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Include credentials so cookies (if any) are sent along
        credentials: 'include',
        body: JSON.stringify({
          user_id,
          product_id,
        }),
      });

      if (response.ok) {
        alert(`Added ${selectedProduct.product_name} to wishlist`);
      } else {
        const errorData = await response.json();
        console.error("Error adding to wishlist:", errorData);
        alert(`Failed to add ${selectedProduct.product_name} to wishlist: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error adding to wishlist", error);
      alert("Error adding to wishlist");
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="product_display">
      {products.map((product) => (
        <div className="item-card" key={product.id || product._id}>
          {product.product_image ? (
            <img
              className="product_image"
              src={`${API_URL}/uploads/${product.product_image}`}
              alt={product.product_name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/path-to-placeholder-image.jpg';
              }}
            />
          ) : (
            <p>No image available</p>
          )}
          <h2 className="product_name">{product.product_name}</h2>
          <p className="product_price">Price: ${product.product_price}</p>
          <div className="button_container">
            <Link to="/product" state={{ product, seller: Username }}>
              <button className="buy_button">Buy Now</button>
            </Link>
            <button
              className="wishlist_button"
              onClick={() => handleAddToWishlist(product)}
            >
              Add to Wishlist
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductDisplay;