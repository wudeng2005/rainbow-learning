-- 装修费用管理工具数据库表结构
-- 在现有 Rainbow 快乐学堂 Supabase 项目中新增加下表

-- 1. 总预算表
CREATE TABLE IF NOT EXISTS decoration_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT 'decoration-user-001',
  total_budget numeric(12,2) NOT NULL DEFAULT 500000,
  updated_at timestamptz DEFAULT now()
);

-- 2. 一级分类表
CREATE TABLE IF NOT EXISTS decoration_categories_l1 (
  category_l1_id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '📦',
  sort_order integer NOT NULL DEFAULT 0
);

-- 3. 二级分类表
CREATE TABLE IF NOT EXISTS decoration_categories_l2 (
  category_l2_id text PRIMARY KEY,
  parent_id text NOT NULL REFERENCES decoration_categories_l1(category_l1_id) ON DELETE CASCADE,
  name text NOT NULL,
  is_custom boolean NOT NULL DEFAULT false
);

-- 4. 费用项目表
CREATE TABLE IF NOT EXISTS decoration_projects (
  project_id text PRIMARY KEY,
  category_l1_id text NOT NULL REFERENCES decoration_categories_l1(category_l1_id),
  category_l2_id text NOT NULL REFERENCES decoration_categories_l2(category_l2_id),
  name text NOT NULL,
  vendor text NOT NULL DEFAULT '',
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT '未付清' CHECK (status IN ('已付清', '未付清')),
  notes text NOT NULL DEFAULT '',
  created_at date NOT NULL DEFAULT CURRENT_DATE,
  updated_at timestamptz DEFAULT now()
);

-- 5. 支付记录表
CREATE TABLE IF NOT EXISTS decoration_payments (
  payment_id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES decoration_projects(project_id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  paid_at date NOT NULL DEFAULT CURRENT_DATE,
  payment_node text CHECK (payment_node IN ('定金', '首款', '中期款', '尾款', '其他')),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_projects_category_l1 ON decoration_projects(category_l1_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON decoration_projects(status);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON decoration_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON decoration_payments(paid_at DESC);

-- 行级安全策略（RLS）：允许匿名读取与写入（装修工具为个人使用，可后续接入认证）
ALTER TABLE decoration_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE decoration_categories_l1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE decoration_categories_l2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE decoration_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE decoration_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_budgets" ON decoration_budgets
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_categories_l1" ON decoration_categories_l1
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_categories_l2" ON decoration_categories_l2
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_projects" ON decoration_projects
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_payments" ON decoration_payments
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 默认一级分类数据
INSERT INTO decoration_categories_l1 (category_l1_id, name, icon, sort_order) VALUES
  ('demolition', '拆除工程', '🔨', 1),
  ('hard_package', '硬装半包', '🧱', 2),
  ('hvac', '空调地暖', '❄️', 3),
  ('doors_windows', '门窗工程', '🪟', 4),
  ('custom_cabinet', '全屋定制', '🚪', 5),
  ('materials', '主材采购', '🛁', 6),
  ('furniture', '家具软装', '🛋️', 7),
  ('appliances', '家电设备', '📺', 8),
  ('design', '设计费', '📐', 9)
ON CONFLICT (category_l1_id) DO NOTHING;

-- 默认二级分类数据
INSERT INTO decoration_categories_l2 (category_l2_id, parent_id, name, is_custom) VALUES
  ('demolition_whole', 'demolition', '全屋拆除', false),
  ('hard_direct', 'hard_package', '直接费', false),
  ('hard_extra', 'hard_package', '增项/变更', false),
  ('hvac_ac', 'hvac', '空调', false),
  ('hvac_floor', 'hvac', '地暖', false),
  ('window_aluminum', 'doors_windows', '窗户', false),
  ('window_balcony', 'doors_windows', '阳台移门', false),
  ('window_entrance', 'doors_windows', '入户门', false),
  ('window_screen', 'doors_windows', '纱窗', false),
  ('cabinet_sideboard', 'custom_cabinet', '餐边柜', false),
  ('cabinet_entry', 'custom_cabinet', '玄关柜', false),
  ('cabinet_master', 'custom_cabinet', '主卧衣柜', false),
  ('cabinet_guest', 'custom_cabinet', '次卧衣柜', false),
  ('cabinet_balcony', 'custom_cabinet', '阳台柜', false),
  ('cabinet_other', 'custom_cabinet', '其他柜体', false),
  ('mat_tile', 'materials', '瓷砖', false),
  ('mat_floor', 'materials', '地板', false),
  ('mat_bath', 'materials', '卫浴洁具', false),
  ('mat_kitchen', 'materials', '厨房橱柜', false),
  ('mat_light', 'materials', '灯具开关', false),
  ('mat_curtain', 'materials', '窗帘软装', false),
  ('mat_stone', 'materials', '石材', false),
  ('fur_living', 'furniture', '客厅家具', false),
  ('fur_dining', 'furniture', '餐厅家具', false),
  ('fur_bedroom', 'furniture', '卧室家具', false),
  ('fur_study', 'furniture', '书房家具', false),
  ('fur_decor', 'furniture', '软装饰品', false),
  ('app_kitchen', 'appliances', '厨房电器', false),
  ('app_cleaning', 'appliances', '清洁电器', false),
  ('app_av', 'appliances', '影音设备', false),
  ('app_env', 'appliances', '环境电器', false),
  ('app_smart', 'appliances', '智能设备', false),
  ('design_fee', 'design', '设计费', false)
ON CONFLICT (category_l2_id) DO NOTHING;

-- 默认预算
INSERT INTO decoration_budgets (user_id, total_budget) VALUES ('decoration-user-001', 500000)
ON CONFLICT (id) DO NOTHING;
