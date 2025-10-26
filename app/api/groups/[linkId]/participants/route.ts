import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, participants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Get group
    const [group] = await db.select().from(groups).where(eq(groups.linkId, linkId));

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Add participant
    const [participant] = await db.insert(participants).values({
      groupId: group.id,
      name: name.trim(),
    }).returning();

    return NextResponse.json({
      success: true,
      participant,
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    return NextResponse.json(
      { error: 'Failed to add participant' },
      { status: 500 }
    );
  }
}
