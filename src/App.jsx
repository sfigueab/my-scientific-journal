import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import logo from './logo.svg';
import './App.css';

import Layout from './components/Layout';
import MainPage from './pages/MainPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TrackingPage from './pages/TrackingPage';
import ProfilePage from './pages/ProfilePage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createSupabaseClient = (key) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'x-user-key': key || '',
      },
    },
  });

let supabase = createSupabaseClient(localStorage.getItem('userKey'));

function App() {
  const [userKey, setUserKey] = useState(localStorage.getItem('userKey') || '');
  const [userName, setUserName] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(!userKey);
  const [showNameInput, setShowNameInput] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const generateNewUser = async () => {
    setError('');
    const newKey = uuidv4();

    const { error: keyError } = await supabase
      .from('keys')
      .insert([{ user_key: newKey }]);

    if (keyError) {
      setError('Key creation error: ' + keyError.message);
      return;
    }

    localStorage.setItem('userKey', newKey);
    setUserKey(newKey);
    supabase = createSupabaseClient(newKey);
    setShowNameInput(true);
  };

  const submitName = async () => {
    if (!inputName.trim()) {
      setError('Please enter a name.');
      return;
    }

    const { error } = await supabase.from('journals').insert({
      user_key: userKey,
      name: inputName,
      created_at: new Date().toISOString(),
    });

    if (error) {
      setError('Failed to save name: ' + error.message);
      return;
    }

    setUserName(inputName);
    setShowWelcome(false);
  };

  const signInWithKey = async () => {
    const storedKey = inputKey.trim();
    if (!storedKey) {
      setError('Please enter your key.');
      return;
    }

    const tempClient = createSupabaseClient(storedKey);
    const { data: keyData, error: keyError } = await tempClient
      .from('keys')
      .select('*')
      .eq('user_key', storedKey)
      .single();

    if (!keyData || keyError) {
      setError('Key not found.');
      return;
    }

    localStorage.setItem('userKey', storedKey);
    setUserKey(storedKey);
    supabase = createSupabaseClient(storedKey);

    const { data: journalData } = await supabase
      .from('journals')
      .select('name')
      .eq('user_key', storedKey)
      .single();

    if (journalData?.name) {
      setUserName(journalData.name);
      setShowWelcome(false);
    } else {
      setShowNameInput(true);
    }
  };

  const signOut = () => {
    setShowConfirmLogout(true);
  };

  const confirmSignOut = () => {
    localStorage.removeItem('userKey');
    setUserKey('');
    setUserName('');
    setInputKey('');
    setInputName('');
    setError('');
    setShowWelcome(true);
    setShowNameInput(false);
    setShowConfirmLogout(false);
  };

  const cancelSignOut = () => {
    setShowConfirmLogout(false);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4 text-center">
        <img src={logo} alt="Logo" className="w-8 h-12 mb-2" />
        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          Welcome to your Research Journey
        </h1>
        <p className="text-gray-600 mb-6 max-w-md">
          Log, review, and preserve your unique research notes.
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {!showNameInput ? (
          <>
            <button
              onClick={generateNewUser}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg mb-4 hover:bg-blue-700 transition"
            >
              Create New Anonymous Key
            </button>

            <div className="w-full max-w-sm mt-4">
              <input
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Enter your existing key"
                className="border border-gray-300 px-4 py-2 rounded w-full mb-2"
              />
              <button
                onClick={signInWithKey}
                className="bg-gray-700 text-white px-4 py-2 rounded w-full hover:bg-gray-800"
              >
                Sign In with Key
              </button>
            </div>
          </>
        ) : (
          <div className="w-full max-w-sm mt-4">
            <p className="mb-2 text-sm text-gray-700">
              Your Anonymous Key (save this): <br />
              <span className="font-mono text-xs break-all">{userKey}</span>
            </p>
            <input
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Enter your name"
              className="border border-gray-300 px-4 py-2 rounded w-full mb-2"
            />
            <button
              onClick={submitName}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
            >
              Continue to Journal
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-4">Sign Out?</h2>
            <p className="mb-6 text-sm text-gray-700">
              Are you sure you want to log out? You will need your key to log in again.
            </p>
            <div className="flex justify-between">
              <button
                onClick={confirmSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={cancelSignOut}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Layout userName={userName} userKey={userKey} signOut={signOut} />}
          >
            <Route index element={<MainPage userKey={userKey} />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="tracking" element={<TrackingPage />} />
            <Route path="profile" element={<ProfilePage userName={userName} />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
