import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LogoutButton from '../Components/LogoutButton/LogoutButton';
import { useNavigate } from 'react-router-dom';
import './CSS/Profile.css';

const API_URL = process.env.REACT_APP_API_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
       
      try {
        const { data } = await axios.get(
          `${API_URL}/profile`,
          { withCredentials: true }
        );

        if (data.status === 'ok' && data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          throw new Error('Not authenticated');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        localStorage.removeItem('user');
        alert('Please log in to view your profile.');
        navigate('/login');
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
           <button className="button" onClick={() => navigate("/myProduct")}>
            My Product
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
