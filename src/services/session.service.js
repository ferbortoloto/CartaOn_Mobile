import { supabase } from '../lib/supabase';

/**
 * Cria uma sessão pendente com código de 6 dígitos.
 */
export async function createSession({ eventId, instructorId, studentId, durationMinutes }) {
  const code = String(Math.floor(100000 + Math.random() * 900000));

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      event_id: eventId || null,
      instructor_id: instructorId,
      student_id: studentId,
      code,
      duration_minutes: durationMinutes || 60,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Busca a sessão pendente de um instrutor (para mostrar o código gerado).
 */
export async function getPendingSession(instructorId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('instructor_id', instructorId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Aluno inicia a sessão usando o código de 6 dígitos.
 * Retorna a sessão ativada ou null se o código for inválido.
 */
export async function startSessionByCode(code, studentId) {
  const { data: session, error: findError } = await supabase
    .from('sessions')
    .select('*')
    .eq('code', code.trim())
    .eq('status', 'pending')
    .maybeSingle();
  if (findError) throw findError;
  if (!session) return null;

  const { data, error } = await supabase
    .from('sessions')
    .update({ status: 'active', started_at: new Date().toISOString() })
    .eq('id', session.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Encerra uma sessão ativa.
 */
export async function endSession(sessionId) {
  const { data, error } = await supabase
    .from('sessions')
    .update({ status: 'completed', ended_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Escuta mudanças de status numa sessão (Realtime).
 * Usado pelo aluno para detectar quando o instrutor gerou o código
 * e pelo instrutor para detectar quando o aluno entrou.
 * Retorna função de unsubscribe.
 */
export function subscribeToSession(instructorId, onUpdate) {
  const channel = supabase
    .channel(`session:instructor:${instructorId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `instructor_id=eq.${instructorId}`,
      },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
