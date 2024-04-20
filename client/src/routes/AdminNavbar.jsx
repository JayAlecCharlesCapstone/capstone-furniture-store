import React from 'react';
import { Link } from 'react-router-dom';

const AdminNavbar = ({ token, logOut }) => {
  return (
    <div className="admin-navbar">
      {token ? (
        <button className="logout-btn" onClick={logOut}>
          Log Out
        </button>
      ) : (
        <Link className="login-link" to="/Login">
          Login
        </Link>
      )}
      <Link className="nav-link" to="/AdminHome">
        Home
      </Link>
      <Link className="nav-link" to="/Register">
        Register
      </Link>
      <Link className="nav-link" to="/Account">
        Cart
      </Link>
      <Link className="nav-link" to="/AddProduct">
        Add Product
      </Link>
    </div>
  );
};

export default AdminNavbar;
