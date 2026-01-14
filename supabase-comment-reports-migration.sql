-- Crear tabla de reportes de comentarios
CREATE TABLE IF NOT EXISTS comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Evitar reportes duplicados del mismo usuario al mismo comentario
  UNIQUE(comment_id, reporter_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON comment_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_reporter_id ON comment_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON comment_reports(status);
CREATE INDEX IF NOT EXISTS idx_comment_reports_created_at ON comment_reports(created_at DESC);

-- Habilitar RLS
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden crear reportes
CREATE POLICY "Users can create reports"
  ON comment_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Política: Los usuarios pueden ver sus propios reportes
CREATE POLICY "Users can view their own reports"
  ON comment_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Política: Los admins pueden ver todos los reportes
CREATE POLICY "Admins can view all reports"
  ON comment_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Política: Los admins pueden actualizar reportes
CREATE POLICY "Admins can update reports"
  ON comment_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_comment_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_comment_reports_updated_at
  BEFORE UPDATE ON comment_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reports_updated_at();
