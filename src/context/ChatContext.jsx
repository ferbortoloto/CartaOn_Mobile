import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../utils/logger';
import { sanitizeMessage } from '../utils/sanitize';
import {
  getConversations,
  getMessages,
  sendMessage as sendMessageService,
  markAsRead,
  subscribeToMessages,
} from '../services/chat.service';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [activeConversationId, setActiveConversationId] = useState(null);
  const unsubscribeRefs = useRef({});

  // Carrega conversas ao autenticar
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setConversations([]);
      setMessagesByConversation({});
      return;
    }
    loadConversations();
  }, [isAuthenticated, user?.id]);

  // Assina realtime das mensagens quando a conversa ativa muda
  useEffect(() => {
    if (!activeConversationId) return;

    // Carrega mensagens da conversa ativa
    loadMessages(activeConversationId);
    markAsRead(activeConversationId, user.id).catch(() => {});

    // Cancela subscription anterior da mesma conversa, se houver
    if (unsubscribeRefs.current[activeConversationId]) {
      unsubscribeRefs.current[activeConversationId]();
    }

    // Inicia nova subscription realtime
    const unsubscribe = subscribeToMessages(activeConversationId, (newMessage) => {
      setMessagesByConversation(prev => ({
        ...prev,
        [activeConversationId]: [...(prev[activeConversationId] || []), newMessage],
      }));
    });

    unsubscribeRefs.current[activeConversationId] = unsubscribe;

    return () => {
      unsubscribe();
      delete unsubscribeRefs.current[activeConversationId];
    };
  }, [activeConversationId]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getConversations(user.id, user.role);
      setConversations(data);
    } catch (error) {
      logger.error('Erro ao carregar conversas:', error.message);
    }
  }, [user]);

  const loadMessages = useCallback(async (conversationId) => {
    try {
      const data = await getMessages(conversationId);
      setMessagesByConversation(prev => ({ ...prev, [conversationId]: data }));
    } catch (error) {
      logger.error('Erro ao carregar mensagens:', error.message);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId, text) => {
    if (!user || !text.trim()) return;
    try {
      const safeText = sanitizeMessage(text.trim());
      if (!safeText) return;
      const message = await sendMessageService(conversationId, user.id, safeText);
      setMessagesByConversation(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), message],
      }));
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error.message);
    }
  }, [user]);

  const markConversationAsRead = useCallback(async (conversationId) => {
    if (!user) return;
    await markAsRead(conversationId, user.id);
    setMessagesByConversation(prev => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map(m => ({ ...m, read: true })),
    }));
  }, [user]);

  const getUnreadCount = useCallback((conversationId) => {
    if (!user) return 0;
    const msgs = messagesByConversation[conversationId] || [];
    return msgs.filter(m => !m.read && m.sender_id !== user.id).length;
  }, [messagesByConversation, user]);

  const getTotalUnreadCount = useCallback(() => {
    return conversations.reduce((total, conv) => total + getUnreadCount(conv.id), 0);
  }, [conversations, getUnreadCount]);

  const openConversation = useCallback(async (conversationId) => {
    setActiveConversationId(conversationId);
    if (!messagesByConversation[conversationId]) {
      await loadMessages(conversationId);
    }
  }, [messagesByConversation, loadMessages]);

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversationId,
      messagesByConversation,
      setActiveConversationId: openConversation,
      sendMessage,
      markConversationAsRead,
      getUnreadCount,
      getTotalUnreadCount,
      loadConversations,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
