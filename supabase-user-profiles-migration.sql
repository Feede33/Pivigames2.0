-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  avatar_seed TEXT, -- Seed para generar avatar consistente
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Nickname debe ser único
  UNIQUE(nickname)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_nickname ON user_profiles(nickname);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver perfiles públicos
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política: Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Función para generar nickname aleatorio único
CREATE OR REPLACE FUNCTION generate_unique_nickname()
RETURNS TEXT AS $$
DECLARE
  adjectives TEXT[] := ARRAY[
    'Swift', 'Brave', 'Clever', 'Mighty', 'Silent', 'Golden', 'Shadow', 'Cosmic',
    'Thunder', 'Crystal', 'Mystic', 'Blazing', 'Frozen', 'Ancient', 'Noble', 'Wild',
    'Lunar', 'Solar', 'Storm', 'Neon', 'Cyber', 'Quantum', 'Stellar', 'Phoenix',
    'Dragon', 'Ninja', 'Samurai', 'Viking', 'Spartan', 'Titan', 'Legend', 'Epic'
  ];
  nouns TEXT[] := ARRAY[
    'Warrior', 'Hunter', 'Mage', 'Rogue', 'Knight', 'Wizard', 'Ranger', 'Paladin',
    'Assassin', 'Monk', 'Druid', 'Bard', 'Cleric', 'Warlock', 'Sorcerer', 'Shaman',
    'Berserker', 'Gladiator', 'Champion', 'Hero', 'Legend', 'Master', 'Sage', 'Oracle',
    'Guardian', 'Sentinel', 'Defender', 'Avenger', 'Crusader', 'Templar', 'Slayer', 'Reaper'
  ];
  new_nickname TEXT;
  random_number TEXT;
  attempts INT := 0;
  max_attempts INT := 100;
BEGIN
  LOOP
    -- Generar nickname: Adjetivo + Sustantivo + Número aleatorio
    random_number := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    new_nickname := adjectives[1 + FLOOR(RANDOM() * array_length(adjectives, 1))] || 
                    nouns[1 + FLOOR(RANDOM() * array_length(nouns, 1))] || 
                    random_number;
    
    -- Verificar si el nickname ya existe
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE nickname = new_nickname) THEN
      RETURN new_nickname;
    END IF;
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      -- Si no se encuentra uno único después de muchos intentos, agregar timestamp
      new_nickname := new_nickname || EXTRACT(EPOCH FROM NOW())::BIGINT;
      RETURN new_nickname;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  new_nickname TEXT;
  avatar_seed TEXT;
BEGIN
  -- Generar nickname único
  new_nickname := generate_unique_nickname();
  
  -- Generar seed para avatar (usar el ID del usuario)
  avatar_seed := NEW.id::TEXT;
  
  -- Crear perfil
  INSERT INTO user_profiles (id, nickname, avatar_seed)
  VALUES (NEW.id, new_nickname, avatar_seed);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Actualizar tabla de comentarios para usar user_profiles
-- Agregar columna para referencia al perfil si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'user_profile_id'
  ) THEN
    ALTER TABLE comments ADD COLUMN user_profile_id UUID REFERENCES user_profiles(id);
  END IF;
END $$;

-- Crear índice para la nueva columna
CREATE INDEX IF NOT EXISTS idx_comments_user_profile_id ON comments(user_profile_id);
