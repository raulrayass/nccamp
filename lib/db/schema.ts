import { pgTable, text, timestamp, serial, numeric, date, integer, boolean } from 'drizzle-orm/pg-core'

// Simple user table - identified only by email
export const appUsers = pgTable('app_users', {
  id: text('id').primaryKey(), // nanoid
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'income' | 'expense' | 'both'
  color: text('color').notNull().default('#6366f1'),
  icon: text('icon').notNull().default('tag'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  categoryId: integer('categoryId').notNull(),
  type: text('type').notNull(), // 'income' | 'expense'
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description').notNull(),
  date: date('date').notNull(),
  paymentMethod: text('paymentMethod').default('cash'), // 'cash' | 'transfer' | 'deposit'
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const attendees = pgTable('attendees', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  age: integer('age'),
  shirtSize: text('shirtSize'), // 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  sex: text('sex'), // 'Hombre' | 'Mujer'
  phone: text('phone'),
  church: text('church'),
  emergencyContactName: text('emergencyContactName'),
  emergencyContactPhone: text('emergencyContactPhone'),
  emergencyContactName2: text('emergencyContactName2'),
  emergencyContactPhone2: text('emergencyContactPhone2'),
  allergies: text('allergies'),
  checkedIn: boolean('checkedIn').notNull().default(false),
  roomId: integer('roomId'),
  teamId: integer('teamId'),
  totalAmount: numeric('totalAmount', { precision: 12, scale: 2 }).notNull().default('0'),
  discount: integer('discount').notNull().default(0), // porcentaje: 0, 10, 20, 30
  amountPaid: numeric('amountPaid', { precision: 12, scale: 2 }).notNull().default('0'),
  status: text('status').notNull().default('pending'), // 'pending' | 'partial' | 'paid'
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const attendeePayments = pgTable('attendee_payments', {
  id: serial('id').primaryKey(),
  attendeeId: integer('attendeeId').notNull(),
  userId: text('userId').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  paymentDate: date('paymentDate').notNull(),
  paymentMethod: text('paymentMethod').default('cash'), // 'cash' | 'transfer' | 'deposit'
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const churches = pgTable('churches', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#4a9d67'),
  country: text('country'), // Country code (e.g., 'MX', 'BR', 'AR') - optional
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  capacity: integer('capacity'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  gameDate: date('gameDate'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const gameScores = pgTable('game_scores', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  gameId: integer('gameId').notNull(),
  teamId: integer('teamId').notNull(),
  points: integer('points').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  age: integer('age'),
  shirtSize: text('shirtSize'), // 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  sex: text('sex'), // 'H' | 'M'
  phone: text('phone'),
  church: text('church'), // Nombre de la iglesia (texto libre, igual que attendees)
  category: text('category'), // Ministerio
  leadTeamId: integer('leadTeamId'), // Referencia a tabla teams
  checkedIn: boolean('checkedIn').notNull().default(false),
  totalAmount: numeric('totalAmount', { precision: 12, scale: 2 }).notNull().default('0'),
  discount: integer('discount').notNull().default(0), // porcentaje: 0, 10, 20, 30
  amountPaid: numeric('amountPaid', { precision: 12, scale: 2 }).notNull().default('0'),
  status: text('status').notNull().default('pending'), // 'pending' | 'partial' | 'paid'
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const staffPayments = pgTable('staff_payments', {
  id: serial('id').primaryKey(),
  staffId: integer('staffId').notNull(),
  userId: text('userId').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  paymentDate: date('paymentDate').notNull(),
  paymentMethod: text('paymentMethod').default('cash'), // 'cash' | 'transfer' | 'deposit'
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export type AppUser = typeof appUsers.$inferSelect
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
export type Attendee = typeof attendees.$inferSelect
export type NewAttendee = typeof attendees.$inferInsert
export type AttendeePayment = typeof attendeePayments.$inferSelect
export type NewAttendeePayment = typeof attendeePayments.$inferInsert
export type Church = typeof churches.$inferSelect
export type NewChurch = typeof churches.$inferInsert
export type Team = typeof teams.$inferSelect
export type NewTeam = typeof teams.$inferInsert
export type Room = typeof rooms.$inferSelect
export type NewRoom = typeof rooms.$inferInsert
export type Game = typeof games.$inferSelect
export type NewGame = typeof games.$inferInsert
export type GameScore = typeof gameScores.$inferSelect
export type NewGameScore = typeof gameScores.$inferInsert
export type Staff = typeof staff.$inferSelect
export type NewStaff = typeof staff.$inferInsert
export type StaffPayment = typeof staffPayments.$inferSelect
export type NewStaffPayment = typeof staffPayments.$inferInsert
