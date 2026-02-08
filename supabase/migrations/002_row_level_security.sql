-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE months ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- PROFILES POLICIES
-- ===========================================
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ===========================================
-- MONTHS POLICIES
-- ===========================================
CREATE POLICY "Users can only access their own months"
ON months FOR ALL
USING (user_id = auth.uid());

-- ===========================================
-- INCOME POLICIES
-- ===========================================
CREATE POLICY "Users can only access their own income"
ON income FOR ALL
USING (user_id = auth.uid());

-- ===========================================
-- EXPENSES POLICIES
-- ===========================================
CREATE POLICY "Users can only access their own expenses"
ON expenses FOR ALL
USING (user_id = auth.uid());

-- ===========================================
-- BUDGET POLICIES
-- ===========================================
CREATE POLICY "Users can only access their own budget"
ON budget FOR ALL
USING (user_id = auth.uid());

-- ===========================================
-- SAVINGS POLICIES
-- ===========================================
CREATE POLICY "Users can only access their own savings"
ON savings FOR ALL
USING (user_id = auth.uid());

-- ===========================================
-- PRO_TIPS POLICIES
-- ===========================================
CREATE POLICY "Users can only access their own pro tips"
ON pro_tips FOR ALL
USING (user_id = auth.uid());

-- ===========================================
-- RECURRING_TRANSACTIONS POLICIES
-- ===========================================
CREATE POLICY "Users can only access their own recurring transactions"
ON recurring_transactions FOR ALL
USING (user_id = auth.uid());

-- ===========================================
-- FUNCTION: Automatically create profile on user signup
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
