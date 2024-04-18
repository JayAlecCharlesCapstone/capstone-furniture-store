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

function App() {
  const [token, setToken] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const fetchUserData = async (token) => {
    try {
      if (token) {
        const response = await fetch("http://localhost:3000/api/v1/customer", {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user information');
        }
        const userData = await response.json();
        setCustomer(userData);

        setIsAdmin(userData.isAdmin || false); 
        if (userData.isAdmin) {
          const adminResponse = await fetch("http://localhost:3000/api/v1/admin/users", {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (!adminResponse.ok) {
            throw new Error('Failed to fetch admin information');
          }
          const adminData = await adminResponse.json();
          setIsAdmin(adminData);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const logOut = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCustomer(null);
    setIsAdmin(false);
    navigate('/Login'); 
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken && savedToken !== "null") {
      setToken(savedToken);
      fetchUserData(savedToken);
    }
  }, []);

  return (
    <>
      {isAdmin ? (
        <AdminNavbar token={token} logOut={logOut} />
      ) : (
        <Navbar token={token} logOut={logOut} />
      )}
      <Routes>
        <Route path="/Account" element={<Account token={token} customer={customer} />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/AdminHome" element={<AdminHome />} />
        <Route path="/Login" element={<Login setToken={setToken} />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/ProductDetails/:productId" element={<ProductDetails token={token} />} />
      </Routes>
    </>
  );
}

export default App;
