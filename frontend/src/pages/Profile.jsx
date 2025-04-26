import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LogoutButton from '../Components/LogoutButton/LogoutButton';
import { useNavigate } from 'react-router-dom';
import './CSS/Profile.css';

const API_URL = process.env.REACT_APP_API_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/profile`, {
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.data.user) {
          setUser({
            ...response.data.user,
            profile_photo: response.data.profile_photo,
            address: response.data.address
          });
        } else {
          throw new Error('Invalid user data structure');
        }
      } catch (err) {
        console.error('Profile fetch error:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);
 
  if (!user) {
    return (
      <div className="container">
        <div className="profileCard">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="profileCard">
        <div className="header">
          <h1 className="title">My Profile</h1>
          <button className="homeButton" onClick={() => navigate('/')}>
            Home
          </button>
        </div>

        <div className="profileSection">
          <div className="avatarContainer">
            {user.profile_photo ? (
              <img
                src={`${API_URL}/uploads/${user.profile_photo}`}
                alt="Profile"
                className="avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.png';
                }}
              />
            ) : (
              <div className="avatar placeholder">No Photo</div>
            )}
          </div>

          <div className="infoContainer">
            <h2 className="username">{user.username}</h2>

            <div className="infoGroup">
              <span className="infoLabel">Email:</span>
              <p className="infoText">{user.email}</p>
            </div>

            <div className="infoGroup">
              <span className="infoLabel">Address:</span>
              <p className="infoText">{user.address}</p>
            </div>
          </div>
        </div>

        <div className="buttonGrid">
          <button
            className="button"
            onClick={() => navigate('/wishlist')}
          >
            Wishlist
          </button>
          <button
            className="button"
            onClick={() => navigate('/myProduct')}
          >
            Edit Profile
          </button>
          <button
            className="button"
            onClick={() => navigate('/orders')}
          >
            Orders
          </button>
          <button
            className="button"
            onClick={() => navigate('/addProduct')}
          >
            Sell Product
          </button>
        </div>

        <div className="logoutContainer">
          <LogoutButton className="logoutbutton" />
        </div>
      </div>
    </div>
  );
};

export default Profile;
