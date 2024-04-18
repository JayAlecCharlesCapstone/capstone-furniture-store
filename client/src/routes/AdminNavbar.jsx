import React from "react";
import { Link } from "react-router-dom";

export default function AdminNavbar({ token, logOut}){
  return(
    <div id= "NavigationsAdmin">
      {token ? <button id ="logoutBtn" onClick={logOut}>Log Out</button>: <Link to ="login">Login</Link>}
      <Link to = "/Home"> Home</Link>
      <Link to = "/Register"> Register</Link>
      <Link to = "/Account"> Cart </Link>
      <Link to = "/AddProduct">Add Product</Link>
    </div>
  );
}
