import React, { useState, useEffect } from 'react';

export default function Account({ token }) {
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState(null);

  async function fetchCustomer() {
    try {
      const response = await fetch("http://localhost:3000/api/v1/customer", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch customer information');
      }
      const result = await response.json();
      setCustomer(result);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchCart() {
    try {
      const response = await fetch("http://localhost:3000/api/v1/customer", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch customer information');
      }
      const result = await response.json();
      console.log(token)
      setCart(result);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (token) {
      fetchCustomer();
      fetchCart(); // You may need to call fetchCart here if you're fetching cart information separately
    }
  }, [token]);

  async function returnProduct(productId) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/cart/${productId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to return product');
      }
      fetchCart(); // Fetch updated cart information after returning the product
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div className='customerInformation'>
        {customer && (
          <>
            <h1>Customer Login Information:</h1>
            <h3>First Name:</h3> <p>{customer.firstname}</p>
            <h3>Last Name:</h3> <p>{customer.lastname}</p>
            <h3>Email:</h3> <p>{customer.email}</p>
          </>
        )}
      </div>

      <div className='cart'>
        <h2>Cart:</h2>
        {cart && cart.length > 0 ? (
          cart.map(product => (
            <div key={product.id}>
              <p>{product.details}</p>
              <button onClick={() => returnProduct(product.id)}>Return Product</button>
            </div>
          ))
        ) : (
          <div>
            <p>No products in cart</p>
          </div>
        )}
      </div>
    </>
  );
}
