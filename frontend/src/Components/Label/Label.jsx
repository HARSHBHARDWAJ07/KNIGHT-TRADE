import React from "react";
import ModelViewer from './Modelviewer';  // Adjust the path based on your project structure
import "./Label.css";

const Header = () => (
  <header className="header">
    <div className="animation-container left">
      <ModelViewer />
    </div>
    <div className="logo-container">
      <h1 className="site-name">Knight Trade</h1>
    </div>
    <div className="animation-container right">
    <ModelViewer />
    </div>
  </header>
);

export default Header;