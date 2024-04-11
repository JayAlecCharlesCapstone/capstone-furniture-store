import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Login({ setToken, token }) {
  const [error, setError] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")

  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    try {


      let response = await fetch(
        "http://localhost:3000/api/v1/customer/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to login")
      }
      setToken(result.token)
      localStorage.setItem("token", result.token)
      if (result.token) {
        navigate("/Home")
      }

    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <>
      <div id='loginErr'>
        {error}
      </div>
      <form id='loginForm' onSubmit={handleSubmit}>
        <label>Email:</label>
        <input value={email} onChange={(event) => setEmail(event.target.value)}></input>
        <br></br>
        <label>Password:</label>
        <input value={password} onChange={(event) => setPassword(event.target.value)}></input>
        <br></br>
        <button>Submit</button>
      </form>
    </>
  )
}