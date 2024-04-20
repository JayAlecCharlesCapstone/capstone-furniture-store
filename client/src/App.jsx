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

function App() {
    const [token, setToken] = useState(null);
    const [newCart, setNewCart] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();
    console.log(isAdmin)

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        // const isAdmin = localStorage.getItem('isAdmin') === 'true';

        if (savedToken) {
            setToken(savedToken);
            setIsAdmin(isAdmin);
        }
    }, [isAdmin]);

    const logOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin'); 
        setToken(null);
        setIsAdmin(false);
        navigate('/Login');
    };



    return (
        <>
          {isAdmin ? (
            <AdminNavbar token={token} logOut={logOut} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
          ) : (
            <Navbar token={token} logOut={logOut} />
          )}
          <Routes>
            <Route path="/Account" element={<Account token={token} newCart={newCart} />} />
            <Route path="/Home" element={<Home token={token} newCart={newCart} />} />
            <Route path="/AdminHome" element={<AdminHome token={token} newCart={newCart} isAdmin={isAdmin} />} />
            <Route path="/Login" element={<Login setToken={setToken} />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/AddProduct" element={<AddProduct token={token} />} />
            <Route path="/ProductDetails/:productId" element={<ProductDetails token={token} />} />
          </Routes>
        </>
      );
    }

export default App;
