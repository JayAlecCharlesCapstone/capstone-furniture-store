import React, { useState } from 'react';

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/customer/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          username: username,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      }

      setName("");
      setUsername("");
      setPhone("");
      setEmail("");
      setPassword("");
      setIsLoading(false);
      alert("Registration successful!");
    } catch (error) {
      console.error(error);
      setError("Failed to register. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <>
      <form id='registrationForm' onSubmit={handleSubmit}>
        <label>Full Name:</label>
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} required />
        <br />
        <label>Username:</label>
        <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} required />
        <br />
        <label>Phone Number:</label>
        <input type="text" value={phone} onChange={(event) => setPhone(event.target.value)} required />
        <br />
        <label>Email:</label>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <br />
        <label>Password:</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <br />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit'}</button>
      </form>
    </>
  );
}
