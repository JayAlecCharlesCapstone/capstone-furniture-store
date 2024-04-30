import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ token, logOut }) => {
  return (
    <div className="navbar">
      {token ? (
        <button className="logout-btn" onClick={logOut}>
          Log Out
        </button>
      ) : (
        <Link className="login-link" to="/Login">
          Login
        </Link>
      )}
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
    </div>
  );
};

export default Navbar;
