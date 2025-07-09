// src/components/Layout.jsx
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

function Layout({ userName, signOut }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      signOut();
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
        <h2 className="font-bold text-lg">Hello, {userName}</h2>
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1">
        {/* Dropdown Menu */}
        <aside className="w-64 bg-gray-50 border-r p-4">
          <label htmlFor="nav-dropdown" className="font-semibold block mb-2">Menu</label>
          <select
            id="nav-dropdown"
            className="w-full border rounded px-2 py-2"
            onChange={(e) => {
              const path = e.target.value;
              if (path) navigate(path);
            }}
            defaultValue=""
          >
            <option value="" disabled>Select a page</option>
            <option value="/">Main</option>
            <option value="/analytics">Analytics</option>
            <option value="/tracking">Personal Tracking</option>
            <option value="/profile">Profile</option>
          </select>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
