/**
 * SecurityProvider
 *
 * Centraliza duas proteções de runtime:
 *
 * 1. TELA DE PRIVACIDADE — quando o app vai para background (home, task switcher),
 *    sobrepõe um ecrã opaco para que capturas de tela do OS não exponham dados.
 *    A tela some automaticamente quando o app volta para foreground.
 *
 * 2. AUTO-LOGOUT POR INATIVIDADE — se o usuário autenticado não interagir com o app
 *    por INACTIVITY_MS (padrão: 30 min), a sessão é encerrada automaticamente.
 *    O timer é reiniciado em qualquer toque na tela e também quando o app volta
 *    do background (desde que o tempo fora não tenha ultrapassado o limite).
 */
import React, {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from 'react';
import { AppState, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutos

const SecurityContext = createContext(null);

export function SecurityProvider({ children }) {
  const { logout, isAuthenticated } = useAuth();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Reinicia o contador de inatividade
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    clearTimeout(timerRef.current);
    if (isAuthenticated) {
      timerRef.current = setTimeout(() => logout(), INACTIVITY_MS);
    }
  }, [isAuthenticated, logout]);

  // Liga/desliga o timer conforme o estado de autenticação
  useEffect(() => {
    if (isAuthenticated) {
      resetTimer();
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [isAuthenticated, resetTimer]);

  // Detecta mudanças de AppState (foreground / background)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setShowPrivacy(false);
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= INACTIVITY_MS && isAuthenticated) {
          logout();
        } else {
          resetTimer();
        }
      } else if (state === 'background' || state === 'inactive') {
        setShowPrivacy(true);
        clearTimeout(timerRef.current);
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, logout, resetTimer]);

  return (
    <SecurityContext.Provider value={{ resetActivity: resetTimer }}>
      {/* onTouchStart captura qualquer toque para reiniciar o timer de inatividade */}
      <View style={styles.fill} onTouchStart={resetTimer}>
        {children}

        {/* Tela de privacidade — visível apenas quando em background */}
        {showPrivacy && (
          <View style={styles.privacyScreen}>
            <View style={styles.lockCircle}>
              <Ionicons name="lock-closed" size={36} color="#1D4ED8" />
            </View>
            <Text style={styles.appName}>CartaOn</Text>
            <Text style={styles.lockText}>Sua sessão está protegida</Text>
          </View>
        )}
      </View>
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  return useContext(SecurityContext);
}

const styles = StyleSheet.create({
  fill: { flex: 1 },

  privacyScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  lockCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
  appName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  lockText: { fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 8 },
});
