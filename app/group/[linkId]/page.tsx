// app/group/[linkId]/page.tsx
'use client';

import { calculateSettlements } from '@/lib/calculations';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Participant {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  paidById: string;
  description: string;
  amount: string;
  splits: Array<{ participantId: string; shareAmount: string }>;
}

export default function GroupPage() {
  const params = useParams();
  const linkId = params.linkId as string;

  const [group, setGroup] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Add expense form
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  // Add participant form
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [addingParticipant, setAddingParticipant] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGroupData();
  }, [linkId]);

  const fetchGroupData = async () => {
    try {
      const response = await fetch(`/api/groups/${linkId}`);
      const data = await response.json();

      if (data.group) {
        setGroup(data.group);
        setParticipants(data.participants);
        setExpenses(data.expenses);
        setPaidBy(data.participants[0]?.id || '');
        setSelectedParticipants(data.participants.map((p: any) => p.id));
      }
    } catch (error) {
      console.error('Error fetching group:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!description || !amount || !paidBy || selectedParticipants.length === 0) {
      alert('Please fill all fields');
      return;
    }

    const totalAmount = parseFloat(amount);
    const shareAmount = totalAmount / selectedParticipants.length;

    const splits = selectedParticipants.map(participantId => ({
      participantId,
      shareAmount,
    }));

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: group.id,
          paidById: paidBy,
          description,
          amount: totalAmount,
          splits,
        }),
      });

      if (response.ok) {
        setDescription('');
        setAmount('');
        fetchGroupData();
      }
    } catch (error) {
      alert('Error adding expense');
    }
  };

  const addParticipant = async () => {
    if (!newParticipantName.trim()) {
      alert('Please enter a name');
      return;
    }

    setAddingParticipant(true);
    try {
      const response = await fetch(`/api/groups/${linkId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newParticipantName.trim(),
        }),
      });

      if (response.ok) {
        setNewParticipantName('');
        setShowAddParticipant(false);
        await fetchGroupData();
        alert(`${newParticipantName} has been added to the group!`);
      } else {
        alert('Failed to add participant');
      }
    } catch (error) {
      alert('Error adding participant');
    } finally {
      setAddingParticipant(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/group/${linkId}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const exportAsPNG = async () => {
    if (summaryRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(summaryRef.current);
        const link = document.createElement('a');
        link.download = `${group.name}-settlement.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error exporting PNG:', error);
        alert('Failed to export PNG');
      }
    }
  };

  const exportAsPDF = async () => {
    if (summaryRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(summaryRef.current);
        const pdf = new jsPDF();
        const imgWidth = 190;
        const imgHeight = (summaryRef.current.offsetHeight * imgWidth) / summaryRef.current.offsetWidth;
        pdf.addImage(dataUrl, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`${group.name}-settlement.pdf`);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Group not found</div>
      </div>
    );
  }

  const { balances, settlements } = calculateSettlements(participants, expenses);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // Debug logging
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔍 Debug Info:');
    console.log('Participants:', participants);
    console.log('Expenses:', expenses);
    console.log('Balances:', balances);
    console.log('Settlements:', settlements);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              📋 Copy Share Link
            </button>
            <button
              onClick={exportAsPNG}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              💾 Export PNG
            </button>
            <button
              onClick={exportAsPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              📄 Export PDF
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Add Expense */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add Expense</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Dinner, Uber, Groceries"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Paid by</label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Split between</label>
                <div className="space-y-2">
                  {participants.map(p => (
                    <label key={p.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParticipants([...selectedParticipants, p.id]);
                          } else {
                            setSelectedParticipants(selectedParticipants.filter(id => id !== p.id));
                          }
                        }}
                        className="rounded"
                      />
                      {p.name}
                    </label>
                  ))}

                  {/* Add Participant Button */}
                  <button
                    type="button"
                    onClick={() => setShowAddParticipant(true)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                  >
                    <span className="text-lg">+</span>
                    <span>Don't see your name? Add yourself</span>
                  </button>
                </div>
              </div>

              {/* Add Participant Dialog */}
              {showAddParticipant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                    <h3 className="text-lg font-semibold mb-4">Add Yourself to Group</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Your name</label>
                        <input
                          type="text"
                          value={newParticipantName}
                          onChange={(e) => setNewParticipantName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full px-3 py-2 border rounded-lg"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addParticipant();
                            }
                          }}
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={addParticipant}
                          disabled={addingParticipant}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {addingParticipant ? 'Adding...' : 'Add Me'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddParticipant(false);
                            setNewParticipantName('');
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={addExpense}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Add Expense
              </button>
            </div>

            {/* Expenses List */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Recent Expenses</h3>
              <div className="space-y-2">
                {expenses.map(expense => {
                  const payer = participants.find(p => p.id === expense.paidById);
                  return (
                    <div key={expense.id} className="p-3 bg-gray-50 rounded border">
                      <div className="flex justify-between">
                        <span className="font-medium">{expense.description}</span>
                        <span className="font-bold">₹{parseFloat(expense.amount).toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-gray-600">Paid by {payer?.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Settlement Summary */}
          <div>
            <div ref={summaryRef} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Settlement Summary</h2>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Expenses</div>
                <div className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Balances</h3>
                {balances.map(b => {
                  const balance = Number(b.balance.toFixed(2));
                  const isPositive = balance > 0.01;
                  const isNegative = balance < -0.01;
                  const isZero = !isPositive && !isNegative;

                  return (
                    <div key={b.name} className="flex justify-between py-2 border-b">
                      <div>
                        <div className="font-medium">{b.name}</div>
                        <div className="text-xs text-gray-500">
                          Paid: ₹{b.paid.toFixed(2)} | Owes: ₹{b.owes.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={
                          isPositive ? 'text-green-600 font-bold' :
                          isNegative ? 'text-red-600 font-bold' :
                          'text-gray-500'
                        }>
                          {isPositive && `+₹${balance.toFixed(2)}`}
                          {isNegative && `-₹${Math.abs(balance).toFixed(2)}`}
                          {isZero && '₹0.00'}
                        </span>
                        <div className="text-xs text-gray-400">
                          {isPositive && 'should receive'}
                          {isNegative && 'should pay'}
                          {isZero && 'settled up'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Who Pays Whom</h3>
                {settlements.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">All settled up! 🎉</p>
                ) : (
                  <div className="space-y-2">
                    {settlements.map((s, i) => (
                      <div key={i} className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <span className="font-medium">{s.from}</span>
                        {' → '}
                        <span className="font-medium">{s.to}</span>
                        <span className="float-right font-bold text-yellow-700">
                          ₹{s.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
