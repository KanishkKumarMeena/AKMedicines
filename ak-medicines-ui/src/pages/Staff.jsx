import React, { useState, useEffect, useCallback } from 'react';
import { useInventory } from '../context/InventoryContext';

export default function Staff() {
  const { apiFetch } = useInventory();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const data = await apiFetch('/api/users');
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Could not load staff list.');
    }
  }, [apiFetch]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: 'staff',
        }),
      });
      setFormData({ name: '', username: '', email: '', password: '' });
      setMessage('New NGO staff account created!');
      setTimeout(() => setMessage(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Could not create user.');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">NGO Staff Accounts</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Add Staff Form */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-300 rounded p-4 shadow-2xs">
            <h2 className="text-base font-bold text-gray-800 mb-3 border-b pb-2">
              Add New Staff Member
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-2.5 rounded mb-3 font-medium">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-100 border border-green-300 text-green-800 text-xs p-2.5 rounded mb-3 font-medium">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asha Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#00171f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. asha.patel"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#00171f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. asha@akmedicines.org"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#00171f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password (min 6 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength="6"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#00171f]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00171f] hover:bg-[#05383b] text-white font-medium text-sm py-2 px-3 rounded shadow-xs cursor-pointer"
              >
                + Create Staff Account
              </button>
            </form>
          </div>
        </div>

        {/* Registered Users Table */}
        <div className="md:col-span-2">
          <div className="bg-white border border-gray-300 rounded overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-sm border-collapse min-w-[450px]">
              <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-300 whitespace-nowrap">
                <tr>
                  <th className="p-3 border-r border-gray-200">Name</th>
                  <th className="p-3 border-r border-gray-200">Username</th>
                  <th className="p-3 border-r border-gray-200">Email</th>
                  <th className="p-3 text-center">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 border-r border-gray-200 font-semibold text-gray-900">
                      {u.name}
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-700 font-mono text-xs">
                      {u.username}
                    </td>
                    <td className="p-3 border-r border-gray-200 text-gray-600">{u.email}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded font-medium ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
