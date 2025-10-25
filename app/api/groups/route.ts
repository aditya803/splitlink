import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, participants } from '@/lib/db/schema';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupName, participantNames } = body;

    if (!groupName || !participantNames || participantNames.length === 0) {
      return NextResponse.json(
        { error: 'Group name and participants are required' },
        { status: 400 }
      );
    }

    // Generate unique link ID
    const linkId = nanoid(10);

    // Create group
    const [group] = await db.insert(groups).values({
      name: groupName,
      linkId,
    }).returning();

    // Create participants
    const participantsData = participantNames.map((name: string) => ({
      groupId: group.id,
      name,
    }));

    await db.insert(participants).values(participantsData);

    return NextResponse.json({
      success: true,
      linkId,
      groupId: group.id,
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
