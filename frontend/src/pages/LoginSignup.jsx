import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginSuccess, loginFailure } from '../redux/authActions';
import './CSS/LoginSignup.css';
import { FaLock } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import React, { useState } from 'react';
import { Label } from '../Components/ui/label';
import { Input } from '../Components/ui/input';
import { Link } from 'react-router-dom';


const API_URL = process.env.REACT_APP_API_URL;

const LoginSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { withCredentials: true }
      );
      console.log('API Response:', response.data);
    
      if (response.data.user && response.data.token) {
        dispatch(loginSuccess(response.data.user, response.data.token));
        navigate('/profile');
      } else if (response.data.message) {
        dispatch(loginFailure(response.data.message)); 
      } else {
        dispatch(loginFailure('Login failed, please try again.'));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during login.';
      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Welcome to KNIGHT TRADE</h1>
      <p className="login-subtitle">Sign in to continue your journey</p>

      <form className="login-form" onSubmit={handleLogin}>
      z
        <LabelInputContainer className="form-group">
          <Label htmlFor="email">Email Address</Label>
          <div className="input-with-icon">
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" Your email"
              required
            />
            <MdEmail className="icon" />
          </div>
        </LabelInputContainer>

        {/* Password Field */}
        <LabelInputContainer className="form-group">
          <Label htmlFor="password">Password</Label>
          <div className="input-with-icon">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" ••••••••"
              required
            />
            <FaLock className="icon" />
          </div>
        </LabelInputContainer>

        <button className="login-buttonnn" type="submit">
          Login
        </button>

        <div className="register-link">
        <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
      </form>
    </div>
  );
};


const LabelInputContainer = ({ children, className }) => {
  return <div className={`label-input-container ${className || ''}`}>{children}</div>;
};

export default LoginSignup;
