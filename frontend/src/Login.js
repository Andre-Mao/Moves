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
    <div className="max-w-xl w-full mx-auto p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
        {isRegistering ? 'Create Account' : 'Welcome Back'}
      </h2>
      <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
          />
        </div>
        {isRegistering && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-orange-600 hover:via-red-600 hover:to-red-700 transition-all font-semibold text-lg shadow-lg"
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      <button 
        onClick={() => setIsRegistering(!isRegistering)}
        className="w-full mt-6 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
      >
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
}

export default Login; 