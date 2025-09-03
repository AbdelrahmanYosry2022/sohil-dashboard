-- إنشاء جداول قاعدة البيانات لمشروع إنتاج الحلقات

-- جدول الحلقات
CREATE TABLE IF NOT EXISTS episodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR CHECK (status IN ('draft', 'in_progress', 'completed')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- جدول محتوى الحلقات
CREATE TABLE IF NOT EXISTS episode_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR CHECK (type IN ('storyboard', 'animation', 'audio', 'text', 'editing', 'drawing')) NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- إضافة فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_episodes_status ON episodes(status);
CREATE INDEX IF NOT EXISTS idx_episodes_created_at ON episodes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_episode_content_episode_id ON episode_content(episode_id);
CREATE INDEX IF NOT EXISTS idx_episode_content_type ON episode_content(type);

-- إضافة تحديث تلقائي لـ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episode_content_updated_at BEFORE UPDATE ON episode_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إدراج بيانات تجريبية
INSERT INTO episodes (title, description, status) VALUES
('الحلقة 1: البداية', 'مقدمة الشخصيات وبداية القصة', 'in_progress'),
('الحلقة 2: التحدّي', 'بناء الصراع وارتفاع الإيقاع', 'draft'),
('الحلقة 3: المواجهة', 'مشاهد الحركة الرئيسية', 'draft'),
('الحلقة 4: الحل', 'حل العقدة ونهاية الآرك', 'draft')
ON CONFLICT (id) DO NOTHING;

-- تمكين Row Level Security (RLS)
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_content ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات أمان أساسية (يمكن تعديلها حسب الحاجة)
CREATE POLICY "Enable read access for all users" ON episodes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON episodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON episodes FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON episodes FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON episode_content FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON episode_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON episode_content FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON episode_content FOR DELETE USING (true);
