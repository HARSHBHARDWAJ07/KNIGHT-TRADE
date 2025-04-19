import React, { useState } from 'react';
import './FilterComponent.css'; 

const FilterComponent = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleDeleteFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setShowNotification(false);
  };

  const handleApplyFilter = () => {
    // Apply the filter logic here
    console.log('Applied Filters:', { minPrice, maxPrice });
    setShowNotification(false);
  };

  return (
    <div className="filter-container">
      <button onClick={() => setShowNotification(!showNotification)}>
        Delete/Apply Filter
      </button>

      {showNotification && (
        <div className="notification">
          <div className="price-filter">
            <label>
              Min Price:
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </label>
            <label>
              Max Price:
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </label>
          </div>
          <div className="filter-buttons">
            <button onClick={handleApplyFilter}>Apply</button>
            <button onClick={handleDeleteFilter}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterComponent;