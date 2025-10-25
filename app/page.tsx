'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState(['', '']);
  const [loading, setLoading] = useState(false);

  const addParticipant = () => setParticipants([...participants, '']);
  const updateParticipant = (index: number, value: string) => {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  };
  const removeParticipant = (index: number) => {
    if (participants.length > 2) setParticipants(participants.filter((_, i) => i !== index));
  };

  const createGroup = async () => {
    const validParticipants = participants.filter(p => p.trim() !== '');
    if (!groupName.trim()) return alert('Please enter a group name');
    if (validParticipants.length < 2) return alert('Add at least 2 participants');
    setLoading(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName: groupName.trim(), participantNames: validParticipants }),
      });
      const data = await res.json();
      if (data.success) router.push(`/group/${data.linkId}`);
      else alert('Failed to create group');
    } catch (e) {
      alert('Error creating group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col items-center">
      {/* Hero Section */}
      <div className="max-w-3xl text-center mt-20 px-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl sm:text-6xl font-extrabold text-gray-800 tracking-tight"
        >
          SplitLink.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 mt-4"
        >
          Create a group, share a link, and let everyone add their expenses — no sign-up, no hassle.
        </motion.p>
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg mt-12 border border-gray-100"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create a New Group</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g., Goa Trip, Birthday Party"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
          {participants.map((p, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={p}
                onChange={(e) => updateParticipant(i, e.target.value)}
                placeholder={`Person ${i + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {participants.length > 2 && (
                <button
                  onClick={() => removeParticipant(i)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addParticipant}
            className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + Add participant
          </button>
        </div>

        <button
          onClick={createGroup}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 transition"
        >
          {loading ? 'Creating...' : 'Create Group & Get Link'}
        </button>
      </motion.div>

      {/* Footer / Highlights */}
      <div className="mt-10 text-center text-gray-600 text-sm mb-10">
        <div className="flex flex-wrap justify-center gap-4">
          <span className="bg-white shadow px-3 py-1 rounded-full">✨ No sign-up required</span>
          <span className="bg-white shadow px-3 py-1 rounded-full">🔗 Share instantly</span>
          <span className="bg-white shadow px-3 py-1 rounded-full">💰 Smart settlement</span>
        </div>
        <p className="mt-6 text-xs text-gray-400">Built with ❤️ by Aditya Pandey</p>
      </div>
    </div>
  );
}
