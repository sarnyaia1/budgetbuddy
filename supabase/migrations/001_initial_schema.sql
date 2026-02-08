-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE expense_category AS ENUM (
  'Bevásárlás',
  'Szórakozás',
  'Vendéglátás',
  'Extra',
  'Utazás',
  'Kötelező kiadás',
  'Ruha',
  'Sport'
);

CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE recurrence_frequency AS ENUM ('weekly', 'monthly', 'yearly');

-- ===========================================
-- PROFILES TABLE (extends auth.users)
-- ===========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- MONTHS TABLE
-- ===========================================
CREATE TABLE months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  starting_balance DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, year, month, deleted_at)
);

-- Indexes for months
CREATE INDEX idx_months_user_year_month ON months(user_id, year, month) WHERE deleted_at IS NULL;
CREATE INDEX idx_months_user_id ON months(user_id) WHERE deleted_at IS NULL;

-- ===========================================
-- INCOME TABLE
-- ===========================================
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  source_type TEXT NOT NULL CHECK (source_type IN ('Fizetés', 'Utalás', 'Vállalkozás', 'Egyéb')),
  custom_source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for income
CREATE INDEX idx_income_user_month ON income(user_id, month_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_income_date ON income(date) WHERE deleted_at IS NULL;
CREATE INDEX idx_income_user_id ON income(user_id) WHERE deleted_at IS NULL;

-- ===========================================
-- EXPENSES TABLE
-- ===========================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  item_name TEXT NOT NULL,
  category expense_category NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for expenses
CREATE INDEX idx_expenses_user_month ON expenses(user_id, month_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_date ON expenses(date) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_category ON expenses(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_user_id ON expenses(user_id) WHERE deleted_at IS NULL;

-- ===========================================
-- BUDGET TABLE
-- ===========================================
CREATE TABLE budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  category expense_category NOT NULL,
  planned_amount DECIMAL(12, 2) NOT NULL CHECK (planned_amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(month_id, category, deleted_at)
);

-- Indexes for budget
CREATE INDEX idx_budget_month ON budget(month_id) WHERE deleted_at IS NULL;

-- ===========================================
-- SAVINGS TABLE
-- ===========================================
CREATE TABLE savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for savings
CREATE INDEX idx_savings_month ON savings(month_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_savings_user ON savings(user_id) WHERE deleted_at IS NULL;

-- ===========================================
-- PRO_TIPS TABLE
-- ===========================================
CREATE TABLE pro_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  tip_text TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for pro_tips
CREATE INDEX idx_pro_tips_month_active ON pro_tips(month_id, is_active) WHERE deleted_at IS NULL;

-- Unique constraint: Only 1 active tip per month
CREATE UNIQUE INDEX idx_pro_tips_month_unique ON pro_tips(month_id)
WHERE is_active = true AND deleted_at IS NULL;

-- ===========================================
-- RECURRING_TRANSACTIONS TABLE
-- ===========================================
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),

  -- Expense fields (nullable, only if type = 'expense')
  category expense_category,
  item_name TEXT,

  -- Income fields (nullable, only if type = 'income')
  source_type TEXT CHECK (source_type IN ('Fizetés', 'Utalás', 'Vállalkozás', 'Egyéb')),
  custom_source TEXT,

  -- Common fields
  notes TEXT,
  frequency recurrence_frequency NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  last_generated_date DATE,
  next_generation_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Validation: expense must have category and item_name, income must have source_type
  CONSTRAINT check_expense_fields CHECK (
    (type = 'expense' AND category IS NOT NULL AND item_name IS NOT NULL) OR
    (type = 'income' AND source_type IS NOT NULL)
  )
);

-- Indexes for recurring_transactions
CREATE INDEX idx_recurring_user_active ON recurring_transactions(user_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_recurring_next_date ON recurring_transactions(next_generation_date, is_active) WHERE deleted_at IS NULL;

-- ===========================================
-- TRIGGERS for updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_months_updated_at BEFORE UPDATE ON months
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON income
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_updated_at BEFORE UPDATE ON budget
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_updated_at BEFORE UPDATE ON savings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
