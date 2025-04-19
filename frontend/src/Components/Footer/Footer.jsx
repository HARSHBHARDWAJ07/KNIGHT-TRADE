// src/Footer.jsx
import React from 'react';
import './Footer.css'; // Import the CSS file for styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="about">
          <h3>About</h3>
          <p>
            Welcome to my portfolio website. Here, you can find information about my projects, skills, and experience.
          </p>
        </div>
        <div className="contact">
          <h3>Contact</h3>
          <ul>
            <li>
              <a href="mailto:your-email@example.com">Email</a>
            </li>
            <li>
              <a href="https://www.instagram.com/yourprofile" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/harsh-bhardwaj-8006072a7?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3Bpw9%2FirVCTwK9qOFheVubUw%3D%3D" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
        <div className="services">
          <h3>Services</h3>
          <ul>
            <li>
              <a href="/web">Web Development</a>
            </li>
            <li>
              <a href="/app">App Development</a>
            </li>
            <li>
              <a href="/video">SEO Optimization</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Harsh Bhardwaj. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
