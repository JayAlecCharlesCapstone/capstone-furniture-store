import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Account from './routes/Account';
import Home from './routes/Home';
import Login from './routes/Login';
import Navbar from './routes/Navbar';
import ProductDetails from './routes/ProductDetails';
import Register from './routes/Register';
import AdminHome from './routes/AdminHome';
import AdminNavbar from './routes/AdminNavbar';
import AddProduct from './routes/AddProduct';
import AdminViewCustomers from './routes/AdminViewCustomers'

function App() {
    const [token, setToken] = useState(null);
    const [newCart, setNewCart] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

   useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedIsAdmin = localStorage.getItem('isAdmin');

    if (savedToken) {
        setToken(savedToken);
    }

    if (savedIsAdmin === 'true') {
        setIsAdmin(true);
    } else {
        setIsAdmin(false); 
    }
}, []);

    const logOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        setToken(null);
        setIsAdmin(false);
        navigate('/Login');
    };
    

    async function addToCart(productId) {
      try {
          const response = await fetch(`http://localhost:3000/api/v1/cart`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                  product_id: productId,
                  quantity: 1
              })
          });
          const result = await response.json();
          alert('Product added to cart!');
      } catch (error) {
          console.error("Error adding item to cart:", error);
      }
  }



    return (
        <>
          {isAdmin ? (
            <AdminNavbar token={token} logOut={logOut} isAdmin={isAdmin} />
          ) : (
            <Navbar token={token} logOut={logOut} />
          )}
          <Routes>
            <Route path="/Account" element={<Account token={token} newCart={newCart} />} />
            <Route path="/Home" element={<Home token={token} newCart={newCart} addToCart={addToCart} />} />
            <Route path="/AdminHome" element={<AdminHome token={token} newCart={newCart} isAdmin={isAdmin} />} />
            <Route path="/Login" element={<Login setToken={setToken} isAdmin={isAdmin} logOut={logOut} setIsAdmin={setIsAdmin} />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/AddProduct" element={<AddProduct token={token} />} />
            <Route path="/AdminViewCustomers" element={<AdminViewCustomers token={token} />} />
            <Route path="/ProductDetails/:productId" element={<ProductDetails token={token} addToCart={addToCart} />} />
          </Routes>
        </>
      );
    }

export default App;
