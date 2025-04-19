import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Label } from '../Components/ui/label';
import { Input } from '../Components/ui/input';
import './CSS/SignUp.css';

const API_URL = process.env.REACT_APP_API_URL;

const SignUp = () => {
  const [username, setUsername]     = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [address, setAddress]       = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [errorMsg, setErrorMsg]     = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('address', address);
    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto);
    }

    try {
      const { status, data } = await axios.post(
        `${API_URL}/signup`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      if (status === 201 && data.user && data.token) {
        // Persist new user and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        alert('Registration successful!');
        navigate('/profile');
      } else if (data.message) {
        setErrorMsg(data.message);
      } else {
        setErrorMsg('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'An unexpected error occurred.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Welcome to KNIGHT TRADE</h2>
      <p className="signup-subtitle">Create your account to join us!</p>

      <form
        className="signup-form"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="form-group">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            required
          />
        </div>

        <div className="form-group">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="form-group">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your address"
            required
          />
        </div>

        <div className="form-group">
          <Label htmlFor="profilePhoto">Profile Photo</Label>
          <Input
            id="profilePhoto"
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePhoto(e.target.files[0])}
            required
          />
        </div>

        {errorMsg && (
          <p className="error-message">{errorMsg}</p>
        )}

        <button className="signup-button" type="submit">
          Sign Up
          <span className="gradient-line gradient-line-1" />
          <span className="gradient-line gradient-line-2" />
        </button>

        <div className="login-link">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="login-anchor">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;