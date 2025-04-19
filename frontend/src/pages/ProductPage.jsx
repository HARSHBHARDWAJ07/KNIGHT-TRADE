import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Searchbar from "../Components/Searchbar/Searchbar";
import "./CSS/pro.css";

const API_URL = process.env.REACT_APP_API_URL;

const ProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleBackToHome = () => {
    setSearchResults([]);
    setIsSearching(false);
    navigate("/");
  };

  const { product = {}, seller = "Unknown Seller" } = location.state || {};

  const handleBuyNow = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("You must be logged in to purchase a product.");
      return navigate("/login");
    }

    let user;
    try {
      user = JSON.parse(storedUser);
    } catch {
      alert("User data corrupted. Please log in again.");
      return navigate("/login");
    }

    const purchaseData = {
      userEmail:        user.email,
      username:         user.username,
      userAddress:      user.address,
      user_id:          user.user_id || user.id,
      productName:      product.product_name,
      productOwnerEmail:product.product_email,
      price:            product.product_price,
      product_id:       product.id || product._id,
    };

    try {
      const response = await axios.post(
        `${API_URL}/purchaseproduct`,
        purchaseData,
        { withCredentials: true }
      );
      if (response.status === 200 || response.status === 201) {
        alert(`Successfully purchased "${product.product_name}"`);
        // e.g. navigate("/order-confirmation");
      } else {
        const err = response.data.error || "Unknown error";
        alert(`Failed to purchase: ${err}`);
      }
    } catch (err) {
      console.error("Purchase error:", err);
      const msg = err.response?.data?.error || "Error processing purchase.";
      alert(msg);
    }
  };

  const handleAddToWishlist = async (selectedProduct) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("You must be logged in to add items to your wishlist.");
      return navigate("/login");
    }

    let user;
    try {
      user = JSON.parse(storedUser);
    } catch {
      alert("User data corrupted. Please log in again.");
      return navigate("/login");
    }

    const user_id    = user.user_id || user.id;
    const product_id = selectedProduct.id || selectedProduct._id;
    if (!user_id || !product_id) {
      return alert("Missing user ID or product ID.");
    }

    try {
      const response = await axios.post(
        `${API_URL}/wishlist/add`,
        { user_id, product_id },
        { withCredentials: true }
      );
      if (response.status === 201) {
        alert(`Added "${selectedProduct.product_name}" to wishlist.`);
      } else {
        const err = response.data.error || "Unknown error";
        alert(`Failed to add to wishlist: ${err}`);
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      const msg = err.response?.data?.error || "Error adding to wishlist.";
      alert(msg);
    }
  };

  // No product passed in state
  if (!product.product_name) {
    return (
      <div className="empty_state">
        <h2>No product selected</h2>
        <button className="primary_button" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="productPage">
      <Searchbar
        setSearchResults={setSearchResults}
        setIsSearching={setIsSearching}
      />
      <div className="separator" />

      {isSearching ? (
        <div className="search_results_container">
          <button
            onClick={handleBackToHome}
            className="back_to_home_button"
          >
            ← Back to Home
          </button>
          <h1 className="search_results_heading">Search Results</h1>

          {searchResults.length > 0 ? (
            <div className="product_display">
              {searchResults.map((prod) => (
                <div className="item-card" key={prod.id || prod._id}>
                  {prod.product_image ? (
                    <img
                      className="product_image"
                      src={`${API_URL}/uploads/${prod.product_image}`}
                      alt={prod.product_name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  ) : (
                    <p>No image available</p>
                  )}
                  <h2 className="product_name">{prod.product_name}</h2>
                  <p className="product_price">
                    Price: ${prod.product_price}
                  </p>
                  <div className="button_container">
                    <Link
                      to="/product"
                      state={{ product: prod, seller }}
                    >
                      <button className="buy_button">Buy Now</button>
                    </Link>
                    <button
                      className="wishlist_button"
                      onClick={() => handleAddToWishlist(prod)}
                    >
                      Add to Wishlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No search results found.</p>
          )}
        </div>
      ) : (
        <div className="product_detail_container">
          <div className="product_visuals">
            {product.product_image ? (
              <img
                className="main_product_image"
                src={`${API_URL}/uploads/${product.product_image}`}
                alt={product.product_name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder.png";
                }}
              />
            ) : (
              <div className="image_placeholder large">
                <span>No Image Available</span>
              </div>
            )}
          </div>

          <div className="product_details">
            <h1 className="product_title">{product.product_name}</h1>
            <div className="price_seller">
              <p className="product_price">
                Price: ${product.product_price}
              </p>
              <p className="product_seller">
                Sold by: {product.user_username}
              </p>
            </div>
            <div className="description_container">
              <h4>Product Description</h4>
              <p className="product_description">
                {product.product_description || "No description available."}
              </p>
            </div>
            <div className="button_group">
              <button
                className="primary_button"
                onClick={handleBuyNow}
              >
                Purchase Now
              </button>
              <button
                className="secondary_button"
                onClick={() => handleAddToWishlist(product)}
              >
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;