/**
 * Logger seguro — só imprime no console em modo de desenvolvimento.
 * Em builds de produção (expo build / eas build), todas as chamadas
 * viram no-op, evitando vazamento de informações sensíveis.
 */
const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

export const logger = {
  log:   isDev ? (...args) => console.log(...args)   : () => {},
  warn:  isDev ? (...args) => console.warn(...args)  : () => {},
  error: isDev ? (...args) => console.error(...args) : () => {},
};
