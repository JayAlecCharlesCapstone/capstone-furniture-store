import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setToken }) {
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      let response = await fetch('http://localhost:3000/api/v1/login/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const adminResult = await response.json();
      console.log(adminResult);
      if (!response.ok) {
        throw new Error(adminResult.message || 'Failed to login');
      }
      if (adminResult.isAdmin) {
        setToken(adminResult.token);
        localStorage.setItem('token', adminResult.token);
        navigate('/Admin');
      } else {
        response = await fetch('http://localhost:3000/api/v1/login/customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        });

        const customerResult = await response.json();
        if (!response.ok) {
          throw new Error(customerResult.message || 'Failed to login');
        }
        setToken(customerResult.token);
        localStorage.setItem('token', customerResult.token);
        navigate('/Home');
      }
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <>
      <div id="loginErr">{error}</div>
      <form id="loginForm" onSubmit={handleSubmit}>
        <label>Username:</label>
        <input value={username} onChange={(event) => setUsername(event.target.value)}></input>
        <br></br>
        <label>Password:</label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
        ></input>
        <br></br>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
