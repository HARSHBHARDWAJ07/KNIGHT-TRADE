import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CiSearch } from 'react-icons/ci';
import { RxCross2 } from 'react-icons/rx';
import './Searchbar.css';

const API_URL = process.env.REACT_APP_API_URL;

const SearchBar = ({ setSearchResults, setIsSearching, onBackToHome }) => {
  const [query, setQuery]               = useState('');
  const [minPrice, setMinPrice]         = useState('');
  const [maxPrice, setMaxPrice]         = useState('');
  const [showFilters, setShowFilters]   = useState(false);
  const [error, setError]               = useState('');

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const navigate        = useNavigate();


  const doSearch = async (q, min, max) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/search`,
        {
          params: {
            q: q || '',
            ...(min !== '' && { minPrice: min }),
            ...(max !== '' && { maxPrice: max }),
          },
          withCredentials: true
        }
      );
      setSearchResults(data);
      setIsSearching(true);
      setError('');
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch search results.');
      setSearchResults([]);
      setIsSearching(true);
    }
  };

 
  const handleSearchSubmit = e => {
    e?.preventDefault();
    doSearch(query, minPrice, maxPrice);
    setShowFilters(false);
  };


  const toggleFilters = () => {
    setShowFilters(f => !f);
  };

 
  const handleDeleteFilter = () => {
    setMinPrice('');
    setMaxPrice('');
  };


  const handleClearSearch = () => {
    setQuery('');
    setMinPrice('');
    setMaxPrice('');
    if (onBackToHome) onBackToHome();
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <button
          type="button"
          className="filter-button"
          onClick={toggleFilters}
        >
          Filters
        </button>

        <div className="search-input-container">
          <CiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search your favorite item"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <RxCross2
              className="clear-icon"
              onClick={handleClearSearch}
            />
          )}
        </div>

        <button
          type="button"
          className="login-button"
          onClick={() =>
            navigate(isAuthenticated ? '/profile' : '/login')
          }
        >
          {isAuthenticated ? 'Profile' : 'Login'}
        </button>
      </form>

      {showFilters && (
        <div className="notification">
          <div className="price-filter">
            <label>
              Min Price:
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
            </label>
            <label>
              Max Price:
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </label>
          </div>
          <div className="filter-buttons">
            <button
              type="button"
              onClick={handleSearchSubmit}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleDeleteFilter}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {error && <p className="search-error">{error}</p>}
    </div>
  );
};

export default SearchBar;