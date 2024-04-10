import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';
<<<<<<< HEAD
=======
<<<<<<< Updated upstream
import account from './routes/account';
import home from './routes/home';
import login from './routes/login';
import navbar from './routes/navbar';
import productdetails from './routes/productdetails';
import register from './routes/register';
import updateproduct from './routes/updateproduct';
=======
>>>>>>> 4bdae31e798d3c3e92e8c8b222810e76627e953e
import Account from './routes/Account';
import Home from './routes/Home';
import Login from './routes/Login';
import Navbar from './routes/Navbar';
<<<<<<< HEAD
import Productdetails from './routes/ProductDetails';
import Register from './routes/Register';
import Updateproduct from './routes/UpdateProduct';
=======
import Productdetails from './routes/Productdetails';
import Register from './routes/Register';
import Updateproduct from './routes/Updateproduct';
>>>>>>> Stashed changes
>>>>>>> 4bdae31e798d3c3e92e8c8b222810e76627e953e


function App() {
    const [token, setToken] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [newCart, setNewCart] = useState(null);
  

    const fetchCustomerData = async (token) => {
        try {
            if (token) {
                const response = await fetch("http://localhost:3000/api/v1/customer", {
                    headers: {
                        'Content-type': 'application/json',
                        'authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to customer user information')
                }
                const result = await response.json();
                console.log(token)
                setCustomer(result);
            }
        } catch (error) {
            console.error(error);
        }
    };


    const logOut = () => {
        localStorage.removeItem("token");
        setToken(null);
        setCustomer(null);
    };

    useEffect(() => {
        let savedToken = localStorage.getItem("token");
        if (savedToken !== "null") {
            setToken(savedToken);
            fetchCustomerData(savedToken)
        }
    }, []);



    return (
        <>
            <Navbar token={token} logOut={logOut} />
            <Routes>
                <Route path="/Account" element={<Account token={token} newCart={newCart} customer={customer} />} />
                {/* <Route path="/home" element={ } /> */}
                <Route path="/Login" element={<Login setToken={setToken} />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/Productdetails" element={< Home />} />
            </Routes>
        </>
    )
}



export default App;