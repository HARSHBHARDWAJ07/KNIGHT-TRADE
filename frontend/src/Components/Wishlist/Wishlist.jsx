import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Wishlist.css';  

const API_URL = process.env.REACT_APP_API_URL;

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const navigate = useNavigate();

 
  useEffect(() => {
    const fetchWishlist = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        return navigate('/login');
      }

      let user;
      try {
        user = JSON.parse(storedUser);
      } catch {
        localStorage.removeItem('user');
        return navigate('/login');
      }
      const user_id = user.user_id || user.id;
      if (!user_id) {
        localStorage.removeItem('user');
        return navigate('/login');
      }

      try {
        const { data } = await axios.get(
          `${API_URL}/api/wishlist`,
          {
            params: { user_id },
            withCredentials: true
          }
        );
        setWishlist(data || []);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load your wishlist. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate]);

 
  const removeFromWishlist = async (product_id) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return navigate('/login');
    }

    let user;
    try {
      user = JSON.parse(storedUser);
    } catch {
      localStorage.removeItem('user');
      return navigate('/login');
    }
    const user_id = user.user_id || user.id;
    if (!user_id) {
      localStorage.removeItem('user');
      return navigate('/login');
    }

    try {
      await axios.delete(
        `${API_URL}/wishlist/remove`,
        {
          data: { user_id, product_id },
          withCredentials: true
        }
      );
    
      setWishlist(prev =>
        prev.filter(item => (item.id || item._id) !== product_id)
      );
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Could not remove item. Please try again.');
    }
  };

  if (loading) return <p>Loading your wishlist…</p>;
  if (error)   return <p className="error">{error}</p>;

  return (
    <div className="wishlist_container">
      {wishlist.length > 0 ? (
        <div className="product_display">
          {wishlist.map((product) => {
            const pid = product.id || product._id;
            return (
              <div className="item-card" key={pid}>
                {product.product_image ? (
                  <img
                    className="product_image"
                    src={`${API_URL}/uploads/${product.product_image}`}
                    alt={product.product_name}
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.png';
                    }}
                  />
                ) : (
                  <div className="no-image">No image</div>
                )}

                <h2 className="product_name">
                  {product.product_name}
                </h2>
                <p className="product_price">
                  Price: ${product.product_price}
                </p>

                <div className="button_container">
                  <Link
                    to="/product"
                    state={{ product }}
                  >
                    <button className="buy_button">
                      Buy Now
                    </button>
                  </Link>
                  <button
                    className="wishlist_button"
                    onClick={() => removeFromWishlist(pid)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No items in your wishlist yet.</p>
      )}
    </div>
  );
};

export default Wishlist;
