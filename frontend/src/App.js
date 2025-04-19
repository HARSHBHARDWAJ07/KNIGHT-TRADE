import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Label from './Components/Label/Label';
import ProductPage from "./pages/ProductPage";
import LoginSignup from "./pages/LoginSignup";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Footer from "./Components/Footer/Footer"
import ProfileDetail from "./Components/ProfileDetail/ProfileDetail";
import Wishlist from "./Components/Wishlist/Wishlist";
import Orders from "./Components/Order/Order";
import ProfilePage from "./Components/ProfilePage/profilepage";

function App() {
  return (
    <Router>
      <Label /> {/* Header appears on all pages */}
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/myProduct" element={<ProfilePage />} />
        <Route path="/addProduct" element={<ProfileDetail />} />
        <Route path="/orders" element={<Orders/>} />
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
