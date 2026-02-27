import { supabase } from '../lib/supabase';

/**
 * Faz login com email e senha.
 * Retorna { user, profile } ou lança erro.
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const profile = await getProfile(data.user.id);
  return { user: data.user, profile };
}

/**
 * Cria conta e perfil completo no banco.
 */
export async function signUp(formData) {
  const {
    name, email, password, phone, cpf, birthdate, role, photoUri,
    licenseCategory, instructorRegNum, carModel, carOptions, pricePerHour, bio,
  } = formData;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role, avatar_url: photoUri || null },
    },
  });
  if (error) throw error;

  // O trigger handle_new_user já cria o profile básico.
  // Aqui atualizamos com os campos completos.
  const profileData = {
    name,
    phone,
    cpf,
    birthdate: birthdate || null,
    role,
    avatar_url: photoUri || null,
    ...(role === 'instructor' ? {
      license_category: licenseCategory,
      instructor_reg_num: instructorRegNum,
      car_model: carModel,
      car_options: carOptions,
      price_per_hour: parseFloat(pricePerHour) || 80,
      bio,
      rating: 0,
      reviews_count: 0,
      is_verified: false,
    } : {}),
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: data.user.id, ...profileData }, { onConflict: 'id' });

  if (profileError) throw profileError;

  // Busca o perfil salvo para garantir dados corretos do banco
  const profile = await getProfile(data.user.id);
  return { user: data.user, profile };
}

/**
 * Faz logout.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Busca o perfil completo de um usuário pelo ID.
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Atualiza campos do perfil do usuário autenticado.
 */
export async function updateProfile(userId, fields) {
  const { data, error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Retorna a sessão ativa (ou null se não há sessão).
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Escuta mudanças de estado de autenticação (login/logout/refresh).
 * Retorna a função de unsubscribe.
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}
