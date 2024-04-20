import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setToken, isAdmin, setIsAdmin }) {
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const navigate = useNavigate();

  const customerHandleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/v1/login/customer", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const result = await response.json();
      setToken(result.token);
      setIsAdmin(false); 
      localStorage.setItem('token', result.token);
      navigate('/Home');
    } catch (error) {
      setError(error.message);
    }
  };

  const adminHandleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/v1/login/admin", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });
  
      const result = await response.json();
      setToken(result.token);
      localStorage.setItem('token', result.token);
      localStorage.setItem('isAdmin', 'true'); 
      setIsAdmin(true); 
      navigate('/AdminHome');
    } catch (error) {
      setError(error.message);
    }
  };
  

  return (
    <>
      <form id='loginForm' onSubmit={customerHandleSubmit}>
        <label>Username:</label>
        <input value={username} onChange={(event) => setUsername(event.target.value)} />
        <br />
        <label>Password:</label>
        <input value={password} type="password" onChange={(event) => setPassword(event.target.value)} />
        <br />
        <button type="submit">Customer Login</button>
      </form>
      <form onSubmit={adminHandleSubmit}>
        <button type="submit">Admin Login</button>
      </form>
      {error && <p>{error}</p>}
    </>
  );
}
