-- Abily — Tabela de avaliações
-- Cole no Editor SQL do Supabase e execute

-- 1. Tabela reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id       uuid REFERENCES public.class_requests(id) ON DELETE SET NULL,
  rating         integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment        text,
  created_at     timestamptz NOT NULL DEFAULT now(),

  -- Um aluno só pode avaliar um instrutor uma vez por aula
  UNIQUE (instructor_id, student_id, event_id)
);

-- 2. RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa autenticada pode ler avaliações
CREATE POLICY "reviews_select"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (true);

-- Aluno só pode inserir avaliação como ele mesmo
CREATE POLICY "reviews_insert"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- 3. Trigger: atualiza rating e reviews_count no perfil do instrutor
CREATE OR REPLACE FUNCTION public.update_instructor_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET
    rating        = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE instructor_id = NEW.instructor_id),
    reviews_count = (SELECT COUNT(*)                       FROM public.reviews WHERE instructor_id = NEW.instructor_id)
  WHERE id = NEW.instructor_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_instructor_rating ON public.reviews;
CREATE TRIGGER trg_update_instructor_rating
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_instructor_rating();
