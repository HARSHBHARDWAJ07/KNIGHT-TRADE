import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfileDetail.css';

const API_URL = process.env.REACT_APP_API_URL;

const ProfileDetail = () => {
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // For image preview
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false); // For loading state
    const fileInputRef = React.createRef();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await axios.get(`${API_URL}/profile`, {
                    withCredentials: true,
                });

                setIsAuthenticated(response.data.status === 'ok');
            } catch (error) {
                console.error('Error checking authentication:', error);
                setIsAuthenticated(false);
            }
        };

        checkAuthentication();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const allowedTypes = ['image/jpeg', 'image/png'];
        const maxSize = 2 * 1024 * 1024; 

        if (file && allowedTypes.includes(file.type) && file.size <= maxSize) {
            setProductImage(file);
            setPreviewImage(URL.createObjectURL(file)); // Generate image preview
        } else {
            alert('Invalid file type or size (max 2MB). Please upload a JPEG or PNG image.');
            e.target.value = '';
        }
    };

    const resetForm = () => {
        setProductName('');
        setProductDescription('');
        setProductPrice('');
        setProductImage(null);
        setPreviewImage(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert('You need to be logged in to add a product.');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('productDescription', productDescription);
        formData.append('productPrice', productPrice);
        formData.append('productImage', productImage);

        try {
            const response = await axios.post(`${API_URL}/profile`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 200) {
                alert('Product added successfully');
                resetForm();
            } else {
                alert('Failed to add product, please try again');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            if (error.response && error.response.data) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('Failed to add product, please try again');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container'>
            <h1>Add Product </h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Product Name:</label>
                    <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Product Description:</label>
                    <textarea
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Product Price:</label>
                    <input
                        type="number"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Product Image:</label>
                    <input
                        type="file"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        required
                    />
                </div>
                {previewImage && (
                    <div>
                        <p>Image Preview:</p>
                        <img
                            src={previewImage}
                            alt="Preview"
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                    </div>
                )}
                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Add Product'}
                </button>
            </form>
        </div>
    );
};

export default ProfileDetail;