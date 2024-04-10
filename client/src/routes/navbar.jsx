import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ token, logOut}){
  return(
    <div id= "Navigations">
      {token ? <button id ="logoutBtn" onClick={logOut}>Log Out</button>: <Link to ="login">Login</Link>}
      <Link to = "/home"> Home(see all products)</Link>
      <Link to = "/register"> Register</Link>
      <Link to = "/account"> Cart </Link>
    </div>
  );
}
