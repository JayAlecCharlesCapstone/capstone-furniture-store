import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ShippingAddressForm from './ShippingAddress';

const Account = ({ token }) => {
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [shippingAddress, setShippingAddress] = useState(null);

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

  const handleQuantityChange = (cartId, newQuantity) => {
    setCart(cart.map(item => {
      if (item.cart_id === cartId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    }))
  }


  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  const returnProduct = async (cartId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/cart/${cartId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to return product');
      }

      await fetchCart();
      alert('Product returned successfully!');
    } catch (error) {
      console.error('Error returning product:', error);
    }
  };

  const handleAddressSubmit = async (addressData) => {
    try {
      console.log('Shipping address submitted:', addressData);
      setShippingAddress(addressData);
      return true;
    } catch (error) {
      console.error('Error submitting shipping address:', error);
      return false;
    }
  };

  const handleOrderSubmit = async (shippingAddress) => {
    try {
      const addressSubmitted = await handleAddressSubmit(shippingAddress);
      if (!addressSubmitted) {
        throw new Error('Please submit a shipping address before placing the order.');
      }

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
        <div id='account-info'>
          <p><strong>Name:</strong> {customer.name}</p>
          <p><strong>Username:</strong> {customer.username}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.phone}</p>
          <button>Edit Account Information</button>
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
              <button onClick={() => returnProduct(item.cart_id)}>Return Product</button>
              <div>
                <button onClick={() => handleQuantityChange(item.cart_id, item.quantity - 1)}> - </button>
                <span>{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item.cart_id, item.quantity + 1)}> + </button>
              </div>
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
