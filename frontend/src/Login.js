import react, { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    axios.post('http://localhost:5000/auth/login', {
      username: username,
      password: password
    })
      .then(response => {
        alert('Login successful!');
        onLoginSuccess(response.data.user);
      })
      .catch(error => {
        alert('Login failed: ' + (error.response?.data?.error || 'Unknown error'));
      });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    axios.post('http://localhost:5000/auth/register', {
      username: username,
      email: email,
      password: password
    })
      .then(response => {
        alert('Registration successful! Please login.');
        setIsRegistering(false);
        setPassword('');
      })
      .catch(error => {
        alert('Registration failed: ' + (error.response?.data?.error || 'Unknown error'));
      });
  };

  return (
    <div>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        {isRegistering && (
          <div>
            <label>Email:</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
}

export default Login;