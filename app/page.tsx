'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState(['', '']);
  const [loading, setLoading] = useState(false);

  const addParticipant = () => {
    setParticipants([...participants, '']);
  };

  const updateParticipant = (index: number, value: string) => {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 2) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const createGroup = async () => {
    const validParticipants = participants.filter(p => p.trim() !== '');

    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (validParticipants.length < 2) {
      alert('Please add at least 2 participants');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: groupName.trim(),
          participantNames: validParticipants,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/group/${data.linkId}`);
      } else {
        alert('Failed to create group');
      }
    } catch (error) {
      alert('Error creating group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SplitLink</h1>
          <p className="text-gray-600">Split expenses without the hassle</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Create a New Group</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Weekend Trip, Dinner Party"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participants
            </label>
            {participants.map((participant, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={participant}
                  onChange={(e) => updateParticipant(index, e.target.value)}
                  placeholder={`Person ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {participants.length > 2 && (
                  <button
                    onClick={() => removeParticipant(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addParticipant}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add participant
            </button>
          </div>

          <button
            onClick={createGroup}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Creating...' : 'Create Group & Get Link'}
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>✨ No sign-up required</p>
          <p>🔗 Share the link with your group</p>
          <p>💰 Everyone adds expenses, instant settlement calculation</p>
        </div>
      </div>
    </div>
  );
}
