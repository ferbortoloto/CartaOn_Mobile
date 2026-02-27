/**
 * Sanitização de entradas do usuário.
 *
 * React Native / React escapam HTML automaticamente nos componentes <Text>,
 * então o risco principal é de caracteres de controle e dados muito longos.
 */

// Regex para caracteres de controle (exceto \t, \n, \r que são legítimos em texto)
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Sanitiza o texto de uma mensagem de chat.
 * Remove caracteres de controle e limita o tamanho.
 */
export function sanitizeMessage(text) {
  return text.replace(CONTROL_CHARS, '').slice(0, 1000);
}

/**
 * Sanitiza texto genérico de formulário (nome, bio, etc).
 * Remove caracteres de controle e limita o tamanho.
 */
export function sanitizeText(text, maxLength = 500) {
  return text.replace(CONTROL_CHARS, '').slice(0, maxLength);
}
