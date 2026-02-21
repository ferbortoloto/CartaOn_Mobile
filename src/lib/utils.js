export const formatMessageTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffMinutes < 1) return 'Agora';
  if (diffMinutes < 60) return `${diffMinutes} min atrás`;
  if (diffMinutes < 24 * 60)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export const formatTimeSeparator = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffMinutes < 1) return 'Agora';
  if (diffMinutes < 60) return `Há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  if (diffMinutes < 24 * 60)
    return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
};

export const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
