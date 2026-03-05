-- ============================================================
-- Separa o ano do veículo em coluna própria (car_year).
-- Antes ficava junto no car_model (ex: "Honda Civic 2023").
--
-- Execute no SQL Editor do Supabase Dashboard.
-- ============================================================

-- 1. Adiciona a coluna car_year em profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS car_year integer;

-- 2. Remove TODAS as versões anteriores da RPC para evitar conflito de assinatura
DROP FUNCTION IF EXISTS public.complete_profile_after_signup(uuid,text,text,text,text,date,text,text,text,text,text,text,numeric,text);
DROP FUNCTION IF EXISTS public.complete_profile_after_signup(uuid,text,text,text,text,date,text,text,text,text,text,text,numeric,text,text);

-- 3. Recria a RPC com p_car_year
CREATE OR REPLACE FUNCTION public.complete_profile_after_signup(
  p_user_id            uuid,
  p_email              text,
  p_name               text,
  p_phone              text,
  p_cpf                text,
  p_birthdate          date,
  p_role               text,
  p_avatar_url         text    DEFAULT NULL,
  p_license_category   text    DEFAULT NULL,
  p_instructor_reg_num text    DEFAULT NULL,
  p_car_model          text    DEFAULT NULL,
  p_car_year           integer DEFAULT NULL,
  p_car_options        text    DEFAULT NULL,
  p_price_per_hour     numeric DEFAULT NULL,
  p_bio                text    DEFAULT NULL,
  p_vehicle_type       text    DEFAULT 'manual'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id          = p_user_id
      AND email       = p_email
      AND created_at  > now() - interval '30 minutes'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: user_id/email inválidos ou janela de cadastro expirada';
  END IF;

  INSERT INTO public.profiles (
    id, name, email, role, avatar_url,
    phone, cpf, birthdate,
    license_category, instructor_reg_num,
    car_model, car_year, car_options, vehicle_type,
    price_per_hour, bio,
    rating, reviews_count, is_verified
  )
  VALUES (
    p_user_id, p_name, p_email, p_role, p_avatar_url,
    p_phone, p_cpf, p_birthdate,
    p_license_category, p_instructor_reg_num,
    p_car_model, p_car_year, p_car_options, p_vehicle_type,
    p_price_per_hour, p_bio,
    CASE WHEN p_role = 'instructor' THEN 0     ELSE NULL  END,
    CASE WHEN p_role = 'instructor' THEN 0     ELSE NULL  END,
    CASE WHEN p_role = 'instructor' THEN false ELSE NULL  END
  )
  ON CONFLICT (id) DO UPDATE SET
    name               = EXCLUDED.name,
    phone              = EXCLUDED.phone,
    cpf                = EXCLUDED.cpf,
    birthdate          = EXCLUDED.birthdate,
    role               = EXCLUDED.role,
    avatar_url         = EXCLUDED.avatar_url,
    license_category   = EXCLUDED.license_category,
    instructor_reg_num = EXCLUDED.instructor_reg_num,
    car_model          = EXCLUDED.car_model,
    car_year           = EXCLUDED.car_year,
    car_options        = EXCLUDED.car_options,
    vehicle_type       = EXCLUDED.vehicle_type,
    price_per_hour     = EXCLUDED.price_per_hour,
    bio                = EXCLUDED.bio,
    rating             = COALESCE(profiles.rating,        EXCLUDED.rating),
    reviews_count      = COALESCE(profiles.reviews_count, EXCLUDED.reviews_count),
    is_verified        = COALESCE(profiles.is_verified,   EXCLUDED.is_verified);
END;
$$;

-- 4. Permissões
GRANT EXECUTE ON FUNCTION public.complete_profile_after_signup TO anon, authenticated;
