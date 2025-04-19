import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
            localStorage.removeItem('user'); 
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed, please try again.');
        }
    };

    return (
        <button onClick={handleLogout}
        className='logoutbutton'
        >
            Logout
        </button>
    );
};

export default LogoutButton;