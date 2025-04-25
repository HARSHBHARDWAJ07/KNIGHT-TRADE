import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LogoutButton from '../Components/LogoutButton/LogoutButton';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './CSS/Profile.css';

const API_URL = process.env.REACT_APP_API_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!isAuthenticated) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/profile`, {
          withCredentials: true,
        });

        if (response.data.status === 'ok') {
          setUser(response.data.user);
        } else {
          handleAuthError();
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        handleAuthError();
      }
    };

    const handleAuthError = () => {
      localStorage.removeItem('token');
      navigate('/login');
    };

    fetchProfile();
  }, [navigate, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="profileCard">
          <p>Redirecting to login...</p>
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

        {user ? (
          <>
            <div className="profileSection">
              <div className="avatarContainer">
                <img
                  src={`${API_URL}/uploads/${user.profile_photo}`}
                  alt="Profile"
                  className="avatar"
                />
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
              <button className="button" onClick={() => navigate('/wishlist')}>
                Wishlist
              </button>
              <button
                className="button"
                onClick={() => navigate('/myProduct')}
              >
                Edit Profile
              </button>
              <button className="button" onClick={() => navigate('/orders')}>
                ORDER
              </button>
              <button className="button" onClick={() => navigate('/addProduct')}>
                SELL PRODUCT
              </button>
            </div>

            <div className="logoutContainer">
              <LogoutButton className="logoutbutton" />
            </div>
          </>
        ) : (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;