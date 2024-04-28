import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminViewCustomers() {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/v1/customer");
                if (!response.ok) {
                    throw new Error("Failed to fetch customers");
                }
                const data = await response.json();
                const customersData = data.data.customers || [];
                setCustomers(customersData);
            } catch (error) {
                console.error("Error fetching customers:", error);
            }
        };

        fetchCustomers();
    }, []);

    return (
        <div>
            <h2 className="allCustomerHeader">All Customers</h2>
            <ul className="customer-list">
                {customers.map((customer) => (
                    <li key={customer.customer_id} className="customer-list-item">
                        <Link to={`/customer/${customer.customer_id}`} className="customer-link">
                            <div className="customer-details">
                                <p><strong>Name:</strong> {customer.name}</p>
                                <p><strong>Username:</strong> {customer.username}</p>
                                <p><strong>Email:</strong> {customer.email}</p>
                                <p><strong>Phone:</strong> {customer.phone}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
