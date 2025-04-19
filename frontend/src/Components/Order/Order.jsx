import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const Orders = () => {
  
  const [username, setUsername] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect ( () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user && user.username) {
            setUsername(user.username);
          } else {
            console.error('Username not found in stored user data.');
            navigate('/login');
          }
        } catch (err) {
          console.error('Error parsing user data from localStorage:', err);
          navigate('/login');
        }
      } else {
        
        navigate('/login');
      }
    }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      let user;
      try {
        user = JSON.parse(storedUser);
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Invalid user data');
        setLoading(false);
        return;
      }

      // Extract user_id from user object (check for user_id or id)
      const user_id = user.user_id || user.id;
      if (!user_id) {
        setError('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/order`, {
          params: { user_id },
          withCredentials: true,
        });
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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


  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="order_display">
      {orders.length > 0 ? (
       orders.map((product) => (
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
                     <Link to="/product" state={{ product ,seller:username }}>
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
               ))
          ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
};

export default Orders;

