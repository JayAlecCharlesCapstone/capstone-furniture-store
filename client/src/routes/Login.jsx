import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Login({ setToken, token }) {
  const [error, setError] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")

  const navigate = useNavigate()

  async function customerHandleSubmit(event) {
    event.preventDefault()
    try {
      let response = await fetch(
        "http://localhost:3000/api/v1/login/customer", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      }
    )
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to login as customer")
      }
      setToken(result.token)
      localStorage.setItem("token", result.token)
      
      if (result.token) {
        navigate("/Home");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  async function adminHandleSubmit(event) {
    event.preventDefault();
    try {
      let response = await fetch(
        "http://localhost:3000/api/v1/login/admin", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            username: username,
            password: password
          })
        }
      )
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to login as admin")
      }
      setToken(result.token)
      localStorage.setItem("token", result.token)

      if (result.token) {
        navigate("/AdminHome")
      }
    } catch (error) {
      setError(error.message)
    }
  }


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
    </>
  );
}
