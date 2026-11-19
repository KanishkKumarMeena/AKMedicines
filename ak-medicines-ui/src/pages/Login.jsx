import React, { useState } from 'react';
import logo from '../assets/AK.svg';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Invalid username or password.');
        setLoading(false);
        return;
      }

      onLogin(data.token, data.user);
    } catch {
      setError('Cannot reach backend server. Make sure the Flask API is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="bg-white border border-gray-300 rounded w-full max-w-sm shadow-2xs overflow-hidden">
        <div className="bg-[#00171f] text-white px-6 py-4 flex items-center gap-3">
          <img src={logo} alt="AK Medicines" className="h-8 w-8 rounded object-contain" />
          <div>
            <h1 className="font-bold text-lg leading-tight">AK Medicines</h1>
            <p className="text-xs text-gray-300">NGO Inventory &amp; Alert System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-800 border-b pb-2">
            NGO Staff Login
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-2.5 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#00171f]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#00171f]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00171f] hover:bg-[#05383b] disabled:opacity-60 text-white font-medium text-sm py-2 px-4 rounded shadow-xs cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-[11px] text-gray-500 text-center pt-1">
            Default NGO Login: <strong>admin</strong> / <strong>admin123</strong>
          </div>
        </form>
      </div>
    </div>
  );
}
