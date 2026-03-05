-- ============================================================
-- Adiciona campos necessários para integração completa do app
-- com o backend Supabase.
--
-- Execute no SQL Editor do Supabase Dashboard.
-- ============================================================

-- 1. Campos extras na tabela class_requests
ALTER TABLE public.class_requests
  ADD COLUMN IF NOT EXISTS type           text    DEFAULT 'Aula Prática',
  ADD COLUMN IF NOT EXISTS car_option     text    DEFAULT 'instructor',
  ADD COLUMN IF NOT EXISTS meeting_point  jsonb,
  ADD COLUMN IF NOT EXISTS requested_slots text[],
  ADD COLUMN IF NOT EXISTS requested_date date,
  ADD COLUMN IF NOT EXISTS price          numeric,
  ADD COLUMN IF NOT EXISTS message        text;

-- 2. Campo purchased_by na tabela plans (contador de compras)
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS purchased_by integer DEFAULT 0;

-- 3. Garante que a coluna coordinates existe em profiles (JSON com latitude/longitude)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS coordinates jsonb,
  ADD COLUMN IF NOT EXISTS location    text,
  ADD COLUMN IF NOT EXISTS goal        text,
  ADD COLUMN IF NOT EXISTS class_duration integer DEFAULT 60;

-- 4. Incrementa purchased_by automaticamente ao inserir uma compra
CREATE OR REPLACE FUNCTION public.increment_plan_purchases()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.plans
    SET purchased_by = COALESCE(purchased_by, 0) + 1
  WHERE id = NEW.plan_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_purchase_increment ON public.purchases;
CREATE TRIGGER on_purchase_increment
  AFTER INSERT ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.increment_plan_purchases();
