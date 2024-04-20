import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom';
import Account from './routes/Account';
import Home from './routes/Home';
import Login from './routes/Login';
import Navbar from './routes/Navbar';
import ProductDetails from "./routes/ProductDetails";
import Register from './routes/Register';
import UpdateProduct from './routes/UpdateProducts'
import AdminHome from './routes/AdminHome'
import AdminNavbar from './routes/AdminNavbar';
import AddProduct from './routes/AddProduct';



function App() {
    const [token, setToken] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [newCart, setNewCart] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();


    const fetchCustomerData = async (token) => {
        try {
            if (token) {
                const response = await fetch("http://localhost:3000/api/v1/customer", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch customer user information')
                }
                const result = await response.json();
                setCustomer(result);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAdminData = async (token) => {
        try {
            if (token) {
                const response = await fetch("http://localhost:3000/api/v1/admin/users", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch admin user information')
                }
                const result = await response.json();
                setIsAdmin(true)
            }
        } catch (error) {
            console.error(error)
        }
    }


    const logOut = () => {
        localStorage.removeItem("token");
        setToken(null);
        setCustomer(null);
        setIsAdmin(false);
        navigate('/Login');
    };

    useEffect(() => {
        let savedToken = localStorage.getItem("token");
        if (savedToken !== "null") {
            setToken(savedToken);
            fetchCustomerData(savedToken)
        }
    }, []);

    useEffect(() => {
        let savedAdminToken = localStorage.getItem("token")
        if (savedAdminToken !== "null") {
            setToken(savedAdminToken)
            fetchAdminData(savedAdminToken)
        }
    }, [isAdmin, token]);

    return (
        <>
            {isAdmin ? (
                <AdminNavbar token={token} logOut={logOut} />
            ) : (
                <Navbar token={token} logOut={logOut} />
            )}
            <Routes>
                <Route path="/Account" element={<Account token={token} newCart={newCart} customer={customer} />} />

                <Route path="/Home" element={<Home />} />

                <Route path='/AdminHome' element={<AdminHome />} />

                <Route path="/Login" element={<Login setToken={setToken} />} />

                <Route path="/Register" element={<Register />} />

                <Route path="/AddProduct" element={<AddProduct token={token} />} />

                <Route path="/ProductDetails/:productId" element={<ProductDetails token={token} />} />
            </Routes>
        </>
    )
}



export default App;

