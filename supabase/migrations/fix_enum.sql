-- Fix task_status enum: add all values the app uses.
-- Run this in Supabase SQL Editor once.

ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'delivered';
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'closed';
