// lib/calculations.ts
export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface ParticipantBalance {
  name: string;
  paid: number;
  owes: number;
  balance: number;
}

export function calculateSettlements(
  participants: Array<{ id: string; name: string }>,
  expenses: Array<{
    paidById: string;
    amount: string;
    splits: Array<{ participantId: string; shareAmount: string }>;
  }>
): { balances: ParticipantBalance[]; settlements: Settlement[] } {
  // Calculate balances for each participant
  const balances = new Map<string, { paid: number; owes: number }>();

  // Initialize
  participants.forEach(p => {
    balances.set(p.id, { paid: 0, owes: 0 });
  });

  // Calculate who paid what and who owes what
  expenses.forEach(expense => {
    const paidAmount = parseFloat(expense.amount);
    const payer = balances.get(expense.paidById)!;
    payer.paid += paidAmount;

    expense.splits.forEach(split => {
      const participant = balances.get(split.participantId)!;
      participant.owes += parseFloat(split.shareAmount);
    });
  });

  // Calculate net balance (positive = should receive, negative = should pay)
  const participantBalances: ParticipantBalance[] = participants.map(p => {
    const b = balances.get(p.id)!;
    const netBalance = b.paid - b.owes;
    return {
      name: p.name,
      paid: Math.round(b.paid * 100) / 100,
      owes: Math.round(b.owes * 100) / 100,
      balance: Math.round(netBalance * 100) / 100,
    };
  });

  // Simplified settlement algorithm
  const settlements: Settlement[] = [];

  // Create copies for settlement calculation (don't mutate original balances)
  const creditors = participantBalances
    .filter(p => p.balance > 0.01)
    .map(p => ({ ...p, remainingBalance: p.balance }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = participantBalances
    .filter(p => p.balance < -0.01)
    .map(p => ({ ...p, remainingBalance: p.balance }))
    .sort((a, b) => a.balance - b.balance);

  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Math.min(creditor.remainingBalance, -debtor.remainingBalance);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.remainingBalance -= amount;
    debtor.remainingBalance += amount;

    if (Math.abs(creditor.remainingBalance) < 0.01) i++;
    if (Math.abs(debtor.remainingBalance) < 0.01) j++;
  }

  return { balances: participantBalances, settlements };
}
