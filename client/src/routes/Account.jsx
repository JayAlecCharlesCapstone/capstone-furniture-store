import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken) {
        setCustomer({
          name: decodedToken.name,
          email: decodedToken.email,
          phone: decodedToken.phone,
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

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  const returnProduct = async (cartId) => {
    console.log('Deleting cart item with cart_id:', cartId);
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

      console.log('Product returned successfully!');
    } catch (error) {
      console.error('Error returning product:', error);
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
            </div>
          ))
        ) : (
          <div>
            <p>No products in cart</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
