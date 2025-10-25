import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses, expenseSplits } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, paidById, description, amount, splits } = body;

    if (!groupId || !paidById || !amount || !splits || splits.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create expense
    const [expense] = await db.insert(expenses).values({
      groupId,
      paidById,
      description: description || 'Expense',
      amount: amount.toString(),
    }).returning();

    // Create splits
    const splitsData = splits.map((split: any) => ({
      expenseId: expense.id,
      participantId: split.participantId,
      shareAmount: split.shareAmount.toString(),
    }));

    await db.insert(expenseSplits).values(splitsData);

    return NextResponse.json({
      success: true,
      expense,
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    return NextResponse.json(
      { error: 'Failed to add expense' },
      { status: 500 }
    );
  }
}
