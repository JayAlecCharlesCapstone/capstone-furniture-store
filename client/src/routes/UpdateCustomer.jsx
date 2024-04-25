import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Account from './Account';

const UpdateCustomer = ({ token }) => {
    const { customerId } = useParams();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const fetchCustomerDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:3000/api/v1/customer/${customerId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch customer details');
                }
                const result = await response.json();
                const { name, username, email, phone } = result.data;
                setName(name);
                setUsername(username);
                setEmail(email);
                setPhone(phone);
            } catch (error) {
                setError('Failed to fetch customer details');
            }
            setIsLoading(false);
        };
        fetchCustomerDetails();
    }, [customerId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const updatedCustomer = { name, username, email, phone };
            const response = await fetch(`http://localhost:3000/api/v1/customer/register/${customerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedCustomer),
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(`Failed to update customer information: ${responseData.message}`);
            }
            alert('Customer information updated successfully!');
        } catch (error) {
            console.error('Error updating customer information:', error.message);
            setError('Failed to update customer information. Please try again.');
        }
        setIsLoading(false);
    };


    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2>Update Customer Information</h2>
            <form onSubmit={handleSubmit}>
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={name || ''}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <label>Username:</label>
                <input
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label>Phone:</label>
                <input
                    type="text"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
                {error && <p>{error}</p>}
                {/* <button type="submit" onClick={handleCustomerUpdate()}>Update</button> */}
            </form>
        </div>
    );
};

export default UpdateCustomer;
