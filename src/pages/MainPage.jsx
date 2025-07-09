import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

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

function MainPage({ userKey }) {
  const [entryText, setEntryText] = useState('');
  const [entries, setEntries] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);

  const supabase = createSupabaseClient(userKey);

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_key', userKey)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEntries(data);
    } else {
      console.error('Error loading entries:', error?.message);
    }
  };

  const saveEntry = async () => {
    if (!entryText.trim()) return;

    const { error } = await supabase.from('entries').insert({
      id: uuidv4(),
      user_key: userKey,
      text: entryText,
      created_at: new Date().toISOString(),
    });

    if (!error) {
      setEntryText('');
      loadEntries();
    } else {
      console.error('Failed to save entry:', error.message);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <div className="relative min-h-screen p-6 flex justify-center items-start">
      {/* Main Journal Entry Box */}
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">New Journal Entry</h1>
        <textarea
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          placeholder="Write your thoughts..."
          rows={6}
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 resize-none"
        />
        <button
          onClick={saveEntry}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Save Entry
        </button>
      </div>

      {/* Bottom Left Drawer */}
      <div className="fixed bottom-0 left-0 m-4 z-50">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowDrawer(!showDrawer)}
        >
          {showDrawer ? 'Hide Entries' : 'Show Entries'}
        </button>

        {showDrawer && (
          <div className="mt-2 w-64 max-h-64 overflow-y-auto bg-white border border-gray-300 rounded shadow p-3">
            {entries.length === 0 ? (
              <p className="text-sm text-gray-500">No past entries.</p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="mb-3 border-b pb-2">
                  <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MainPage;
