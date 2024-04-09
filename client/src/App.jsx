import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';
import Account from './routes/Account';
import Home from './routes/Home';
import Login from './routes/Login';
import Navbar from './routes/Navbar';
import Productdetails from './routes/ProductDetails';
import Register from './routes/Register';
import Updateproduct from './routes/UpdateProduct';


function App() {
    const [token, setToken] = useState(null);
    const [customer, setCustomer] = useState(null);
  

    const fetchCustomerData = async (token) => {
        try {
            if (token) {
                const response = await fetch("http://localhost:3000/api/v1/customer", {
                    headers: {
                        'Content-type': 'application/json',
                        'authorization': `Bearer${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to customer user information')
                }
                const result = await response.json();
                console.log(token)
                setCustomer(result);
            }
        } catch (err) {
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
            <Navigations token={token} logOut={logOut} />
            <Routes>
                <Route path="/account" element={<Account token={token} newCart={newCart} customer={customer} />} />
                {/* <Route path="/home" element={ } /> */}
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/productdetails" element={< Home />} />
            </Routes>
        </>
    )
}



export default App;