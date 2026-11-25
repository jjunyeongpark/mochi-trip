import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const monthlySpend=sqliteTable('monthly_spend',{month:text('month').primaryKey(),amount:integer('amount').notNull()});
export const rateLimits=sqliteTable('rate_limits',{key:text('key').primaryKey(),count:integer('count').notNull(),expires:integer('expires').notNull()});
export const trips=sqliteTable('trips',{id:text('id').primaryKey(),payload:text('payload').notNull(),created:integer('created').notNull(),expires:integer('expires').notNull()});
