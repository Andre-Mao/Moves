import { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
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
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isRegistering ? 'Register' : 'Login'}
      </h2>
      <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username:
          </label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {isRegistering && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email:
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password:
          </label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      <button 
        onClick={() => setIsRegistering(!isRegistering)}
        className="w-full mt-4 text-blue-500 hover:text-blue-700 text-sm"
      >
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
}

export default Login; 