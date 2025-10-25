import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, participants, expenses, expenseSplits } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;

    // Get group
    const [group] = await db.select().from(groups).where(eq(groups.linkId, linkId));

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Get participants
    const participantsList = await db.select().from(participants).where(eq(participants.groupId, group.id));

    // Get expenses with splits
    const expensesList = await db.select().from(expenses).where(eq(expenses.groupId, group.id));

    const expensesWithSplits = await Promise.all(
      expensesList.map(async (expense) => {
        const splits = await db.select().from(expenseSplits).where(eq(expenseSplits.expenseId, expense.id));
        return { ...expense, splits };
      })
    );

    return NextResponse.json({
      group,
      participants: participantsList,
      expenses: expensesWithSplits,
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group data' },
      { status: 500 }
    );
  }
}
