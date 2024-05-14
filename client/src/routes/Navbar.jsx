import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ token, logOut }) => {
  return (
    <div className="navbar">
      <img id='jac-nav-image' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGAr_deIgeShHJiEQ4UlkgXNBui9ozVbBoPc3JirjK4Q&s'></img>

      <Link className="nav-link" to="/Home">
        Home
      </Link>
      {!token && (
        <Link className="nav-link" to="/Register">
          Register
        </Link>
      )}
      <Link className="nav-link" to="/Account">
        Cart
      </Link>
      {token ? (
        <button className="logout-btn" onClick={logOut}>
          Log Out
        </button>
      ) : (
        <Link className="login-link" to="/Login">
          Login
        </Link>
      )}

    </div>
  );
};

export default Navbar;
