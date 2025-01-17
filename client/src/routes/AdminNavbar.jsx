import React from 'react';
import { Link } from 'react-router-dom';

const AdminNavbar = ({ token, logOut }) => {
  return (

    <div className="admin-navbar">
      <img id='jac-nav-image' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGAr_deIgeShHJiEQ4UlkgXNBui9ozVbBoPc3JirjK4Q&s'></img>
      <Link className="nav-link" to="/AdminHome">
        Home
      </Link>
      <Link className="nav-link" to="/AddProduct">
        Add Product
      </Link>
      <Link className="nav-link" to="/AdminViewCustomers">
        View All Customer
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

export default AdminNavbar;
