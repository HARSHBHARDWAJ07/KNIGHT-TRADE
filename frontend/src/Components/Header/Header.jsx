import React from 'react'
import './Header.css'
import { Link } from 'react-router-dom';

const Header = () => {
    
  

  return (
    <div className='header'>
<header>
        <button className="logo">
            KNIGHT TRADE
        </button>
        <nav>
            <ul class="nav-links">
             <Link to='./'> <button className='feature' alt='home'> <li><a href="#home">
                <i>h</i>
                <i>o</i>
                <i>m</i>
                <i>e</i>
                </a></li></button></Link>
             <Link to='./login'> <button className='feature' alt='login'> <li><a href="#login">
              <i>l</i>
              <i>o</i>
              <i>g</i>
              <i>i</i>
              <i>n</i>
                </a></li></button></Link>
              <Link to='./register'> <button className='feature' alt='register'> <li><a href="#register">
              <i>r</i>
              <i>e</i>
              <i>g</i>
              <i>i</i>
              <i>s</i>
              <i>t</i>
              <i>e</i>
              <i>r</i>
                </a></li></button></Link>
              <Link to ='./profile'><button className='feature' alt='profile'> <li><a href="#profile">
              <i>p</i>
              <i>r</i>
              <i>o</i>
              <i>f</i>
              <i>i</i>
              <i>l</i>
              <i>e</i>
                </a></li></button></Link>
              <button className='feature' alt='contact'><li><a href="#contact">
              <i>c</i>
              <i>o</i>
              <i>n</i>
              <i>t</i>
              <i>a</i>
              <i>c</i>
              <i>t</i>
              </a></li></button>        
            </ul>
        </nav>
    </header>
    </div>
  )
}

export default Header;
