import React, { useState, useEffect } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Searchbar from '../Components/Searchbar/Searchbar';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import './CSS/Home.css';

const API_URL = process.env.REACT_APP_API_URL;

const Home = ({ Username }) => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setIsAuthenticated(!!storedUser);
  }, []);

  const handleBackToHome = () => {
    setIsSearching(false);
    setSearchResults([]);
  };

  const handleProductSpecificClick = async (searchWord, e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get(`${API_URL}/search`, {
        params: { q: searchWord },
        withCredentials: true
      });
      setSearchResults(data);
      setIsSearching(true);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
      setIsSearching(true);
    }
  };

  const handleAddToWishlist = async (selectedProduct) => {
    if (!isAuthenticated) {
      alert("You must be logged in to add items to your wishlist.");
      navigate('/login');
      return;
    }
  
    const storedUser = localStorage.getItem('user');
    let user;
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      alert("User data is corrupted, please log in again.");
      navigate('/login');
      return;
    }
  
    const user_id = user?.user_id || user?.id;
    const product_id = selectedProduct?.id || selectedProduct?._id;
  
    if (!user_id || !product_id) {
      alert("User ID or Product ID not found.");
      return;
    }
  
    try {
      const response = await axios.post(
        `${API_URL}/wishlist/add`,
        { user_id: parseInt(user_id), product_id: parseInt(product_id) }, // Ensure integers
        { withCredentials: true }
      );
     
      if (response.status === 201) {
        alert(`Added ${selectedProduct.product_name} to wishlist`);
      } else {
        alert(`Failed to add ${selectedProduct.product_name} to wishlist`);
      }
    } catch (error) {
      console.error("Error adding to wishlist", error);
      alert("Error adding to wishlist. Please try again.");
    }
  };
  

  return (
    <div className="home_page">
      <Searchbar
        setSearchResults={setSearchResults}
        setIsSearching={setIsSearching}
        onBackToHome={handleBackToHome}
        isAuthenticated={isAuthenticated}
      />
      
      <div className="separator"></div>

      {isSearching ? (
        <div className="search_results_container">
          <button onClick={handleBackToHome} className="back_to_home_button">
            Back to Home
          </button>
          <h1 className="search_results_heading">Search Results</h1>
          {searchResults.length > 0 ? (
            <div className="product_display">
              {searchResults.map((product) => (
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
          ) : (
            <p className="no_results_message">No results found</p>
          )}
        </div>
      ) : (
        <>
          <ul className="product_specific">
            <li>
              <a href="/cycle" onClick={() => handleProductSpecificClick('cycle')}>
                Cycle
              </a>
            </li>
            <li>
              <a href="/laptop" onClick={() => handleProductSpecificClick('Laptop')}>
                Laptop
              </a>
            </li>
            <li>
              <a href="/lamp" onClick={() => handleProductSpecificClick('Lamp')}>
                Lamp
              </a>
            </li>
            <li>
              <a href="/cooler" onClick={() => handleProductSpecificClick('Cooler')}>
                Cooler
              </a>
            </li>
            <li>
              <a href="/guiter" onClick={() => handleProductSpecificClick('Guiter')}>
                Guiter
              </a>
            </li>
            <li>
              <a href="/mouse" onClick={() => handleProductSpecificClick('Mouse')}>
                Mouse
              </a>
            </li>
            <li>
              <a href="/football" onClick={() => handleProductSpecificClick('Football')}>
                Football
              </a>
            </li>
          </ul>
          <ProductDisplay />
        </>
      )}
    </div>
  );
};

export default Home;



























