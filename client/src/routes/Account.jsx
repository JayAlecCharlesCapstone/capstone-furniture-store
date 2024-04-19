import React, { useState, useEffect } from 'react';

export default function Account({ token }) {
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState(null);
  // console.log(customer)

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
      setCustomer(result.data.customers);
      // console.log(result)
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchCart() {
    try {
      const response = await fetch("http://localhost:3000/api/v1/cart", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch customer information');
      }
      const result = await response.json();
      // console.log(token)
      setCart(result.data.cart);
      // console.log(result)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (token) {
      fetchCustomer();
      fetchCart(); 
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
      fetchCart(); 
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
     <div className='customerInformation'>
  <h2>Customer Information:</h2>
  {customer && customer.length > 0 && (
    customer.map(customer => (
      <div key={customer.id}>
        <p>Name: {customer.name}</p>
      </div>
    ))
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
