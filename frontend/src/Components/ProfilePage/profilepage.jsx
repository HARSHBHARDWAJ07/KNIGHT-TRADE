import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';

const API_URL = process.env.REACT_APP_API_URL;

const ProfilePage = () => {
  const [username, setUsername] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return navigate('/login');
    }
    try {
      const user = JSON.parse(storedUser);
      if (!user.username) throw new Error('No username');
      setUsername(user.username);
    } catch (err) {
      console.error('Error reading user:', err);
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);


  useEffect(() => {
    if (!username) return;

    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/products`,
          {
            params: { username },
            withCredentials: true
          }
        );
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load your products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [username]);

  const deleteProduct = async (product_id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await axios.delete(
        `${API_URL}/delete/product`,
        {
          data: { product_id },
          withCredentials: true
        }
      );
  
      setProducts(prev =>
        prev.filter(prod => (prod.id || prod._id) !== product_id)
      );
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Could not delete the product. Please try again.');
    }
  };

  if (loading) {
    return <p>Loading your products…</p>;
  }
  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="product_display">
      {products.map((product) => (
        <div className="item-card" key={product.id}>
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
            <Link to="/product" state={{ product, seller: username }}>
              <button className="buy_button">Buy Now</button>
            </Link>
            <button
              className="wishlist_button"
              onClick={() => deleteProduct(product.id)}>
              Remove the product
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfilePage;