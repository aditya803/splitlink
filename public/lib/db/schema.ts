import { pgTable, uuid, varchar, timestamp, decimal } from 'drizzle-orm/pg-core';

export const groups = pgTable('groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  linkId: varchar('link_id', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const participants = pgTable('participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' }),
  paidById: uuid('paid_by_id').references(() => participants.id),
  description: varchar('description', { length: 255 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const expenseSplits = pgTable('expense_splits', {
  id: uuid('id').defaultRandom().primaryKey(),
  expenseId: uuid('expense_id').references(() => expenses.id, { onDelete: 'cascade' }),
  participantId: uuid('participant_id').references(() => participants.id),
  shareAmount: decimal('share_amount', { precision: 10, scale: 2 }).notNull(),
});
