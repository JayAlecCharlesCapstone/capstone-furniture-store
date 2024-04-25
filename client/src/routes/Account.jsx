import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ShippingAddressForm from './ShippingAddress';
const Account = ({ token }) => {
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const decodeToken = (token) => {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
  useEffect(() => {
    const fetchCustomer = async () => {
      if (token) {
        const decodedToken = decodeToken(token);
        if (decodedToken) {
          setCustomer({
            name: decodedToken.name,
            username: decodedToken.username,
            email: decodedToken.email,
            phone: decodedToken.phone,
            customer_id: decodedToken.id,
          });
        }
      }
    };
    fetchCustomer();
  }, [token]);
  const fetchCart = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/cart", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch cart information');
      }
      const result = await response.json();
      setCart(result.data.cartItems);
    } catch (error) {
      console.error('Error fetching cart information:', error);
    }
  };
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);
  const handleCustomerUpdate = (updatedCustomer) => {
    setCustomer(updatedCustomer);
  };
  const handleOrderSubmit = async (shippingAddress) => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/orders", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_id: customer.customer_id,
          shipping_address_id: shippingAddress.address_id
        })
      });
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      const result = await response.json();
      console.log(result);
      setCart([]);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };
  return (
    <div>
      <h2>Account Information</h2>
      {customer ? (
        <div>
          <p><strong>Name:</strong> {customer.name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.phone}</p>
          <p><strong>Username:</strong> {customer.username}</p>
          <Link to={`/UpdateCustomer/${customer.customer_id}`}>
            <button>Edit Customer Information</button>
          </Link>
        </div>
      ) : (
        <p>Loading customer information...</p>
      )}
      <div className='cart'>
        <h2>Cart:</h2>
        {cart && cart.length > 0 ? (
          cart.map(item => (
            <div key={item.cart_id}>
              <p><strong>Product Name:</strong> {item.product_name}</p>
              <p><strong>Description:</strong> {item.product_description}</p>
              <p><strong>Price:</strong> ${item.price}</p>
            </div>
          ))
        ) : (
          <div>
            <p>No products in cart</p>
          </div>
        )}
      </div>
      <div>
        <h2>Shipping Address</h2>
        <ShippingAddressForm onSubmit={handleOrderSubmit} />
      </div>
    </div>
  );
};
export default Account;