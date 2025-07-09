
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import logo from './logo.svg';
import './App.css';



const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;



const createSupabaseClient = (key) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        "x-user-key": key || "",
      },
    },
  });

let supabase = createSupabaseClient(localStorage.getItem("userKey"));


function App() {
  const [userKey, setUserKey] = useState(localStorage.getItem("userKey") || "");
  const [userName, setUserName] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [inputName, setInputName] = useState("");
  const [entryText, setEntryText] = useState("");
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showNameInput, setShowNameInput] = useState(false);

  const generateNewUser = async () => {
    setError("");
    const newKey = uuidv4();

    const { error: keyError } = await supabase
      .from("keys")
      .insert([{ user_key: newKey }]);

    if (keyError) {
      setError("Key creation error: " + keyError.message);
      return;
    }

    localStorage.setItem("userKey", newKey);
    setUserKey(newKey);
    supabase = createSupabaseClient(newKey);
    setShowNameInput(true);
  };

  const submitName = async () => {
    if (!inputName.trim()) {
      setError("Please enter a name.");
      return;
    }

    const { error } = await supabase.from("journals").insert({
      user_key: userKey,
      name: inputName,
      created_at: new Date().toISOString(),
    });

    if (error) {
      setError("Failed to save name: " + error.message);
      return;
    }

    setUserName(inputName);
    setShowWelcome(false);
    loadEntries(userKey);
  };

  const signInWithKey = async () => {
    const storedKey = inputKey.trim();
    if (!storedKey) {
      setError("Please enter your key.");
      return;
    }

    // ✅ Re-create client with provided key
    const tempClient = createSupabaseClient(storedKey);

    // ✅ Use that client to check key existence
    const { data: keyData, error: keyError } = await tempClient
      .from("keys")
      .select("*")
      .eq("user_key", storedKey)
      .single();

    if (!keyData || keyError) {
      setError("Key not found.");
      return;
    }

    // ✅ Key exists — store and update globally
    localStorage.setItem("userKey", storedKey);
    setUserKey(storedKey);
    supabase = createSupabaseClient(storedKey);

    // ✅ Check for user's name
    const { data: journalData } = await supabase
      .from("journals")
      .select("name")
      .eq("user_key", storedKey)
      .single();

    if (journalData?.name) {
      setUserName(journalData.name);
      setShowWelcome(false);
      loadEntries(storedKey);
    } else {
      setShowNameInput(true);
    }
  };

  const loadEntries = async (key) => {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("user_key", key)
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to load entries: " + error.message);
      return;
    }

    setEntries(data);
  };

  const saveEntry = async () => {
    if (!entryText.trim()) return;

    const { error } = await supabase.from("entries").insert({
      id: uuidv4(),
      user_key: userKey,
      text: entryText,
      created_at: new Date().toISOString(),
    });

    if (!error) {
      setEntryText("");
      loadEntries(userKey);
    } else {
      setError("Failed to save entry: " + error.message);
    }
  };

  const deleteEntry = async (id) => {
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (!error) {
      loadEntries(userKey);
    } else {
      setError("Delete error: " + error.message);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("userKey");
    setUserKey("");
    window.location.reload();
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4 text-center">
        <img src={logo} alt="Logo" className="w-8 h-12 mb-2" />
        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          Welcome to your Research Journey
        </h1>
        <p className="text-gray-600 mb-6 max-w-md">
          Log, review, and save your unique research notes.
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

  (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto text-center">
        <button
          onClick={handleSignOut}
          className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 text-sm"
        >
          Sign Out
        </button>

        <h1 className="text-3xl font-bold text-blue-700 mb-2">Research Journey</h1>

        {userName && (
          <p className="text-sm text-gray-600 mb-4">
            Logged in as: <strong>{userName}</strong>
          </p>
        )}return 

        {userKey && (
          <div className="bg-blue-100 border border-blue-300 text-blue-900 p-4 rounded-xl mb-6 shadow">
            <p className="text-sm font-semibold mb-1">Your Anonymous Key:</p>
            <p className="font-mono text-xs break-all">{userKey}</p>
            <p className="text-xs text-gray-500 mt-1">
              Save this key to log back in next time.
            </p>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <textarea
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            placeholder="Write your research notes here..."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded mb-4 resize-none"
          />
          <button
            onClick={saveEntry}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Entry
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Previous Entries</h2>
          {entries.length === 0 ? (
            <p className="text-gray-500">No entries yet.</p>
          ) : (
            <ul className="space-y-4">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="bg-white p-4 rounded shadow flex justify-between items-start"
                >
                  <div>
                    <p className="mb-2 whitespace-pre-wrap">{entry.text}</p>
                    <small className="text-gray-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </small>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="ml-4 text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;