import React, { useState } from 'react';
import axios from 'axios';

import { API_URL } from '../config';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState('WORKER');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegistering) {
        await axios.post(`${API_URL}/api/auth/register/`, {
          username: phoneNumber,
          phone_number: phoneNumber,
          password: password,
          role: role
        });
      }
      
      const res = await axios.post(`${API_URL}/api/auth/login/`, {
        phone_number: phoneNumber,
        password: password
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      
      if (res.data.role === 'ADMIN') {
        window.location.href = '/admin';
      } else if (res.data.role === 'WORKER') {
        window.location.href = '/worker';
      } else {
        window.location.href = '/enterprise';
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        // Handle specific Django REST Framework error formats
        if (err.response.data.error) {
          setError(err.response.data.error);
        } else if (err.response.data.username) {
          setError(`Username error: ${err.response.data.username[0]}`);
        } else if (err.response.data.phone_number) {
          setError(`Phone number error: ${err.response.data.phone_number[0]}`);
        } else if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else {
          setError('Authentication failed. Please check your credentials.');
        }
      } else {
        setError('Network error. Is the backend running?');
      }
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {isRegistering ? 'Create Account' : 'Sign In'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="sr-only">Phone Number</label>
              <input
                type="tel"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="sr-only">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-lg"
                placeholder="Password / PIN"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {isRegistering && (
              <div className="flex justify-around py-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" value="WORKER" checked={role === 'WORKER'} onChange={() => setRole('WORKER')} className="text-purple-600 focus:ring-purple-500 h-5 w-5" />
                  <span className="text-lg">Worker</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" value="ENTERPRISE" checked={role === 'ENTERPRISE'} onChange={() => setRole('ENTERPRISE')} className="text-purple-600 focus:ring-purple-500 h-5 w-5" />
                  <span className="text-lg">Business</span>
                </label>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-xl font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 pt-3 pb-3"
            >
              {isRegistering ? 'Register' : 'Sign In (Firebase)'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-purple-600 hover:text-purple-500 font-medium text-lg">
            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
}


