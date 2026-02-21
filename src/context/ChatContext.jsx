import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';

const ChatContext = createContext(null);

const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-pedro',
    instructorId: 'instructor_1',
    studentId: 'user_pedro',
    studentName: 'Pedro Santos',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
    instructorName: 'Carlos Silva',
    instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
    messages: [
      { id: 'm1', senderId: 'instructor_1', text: 'Olá Pedro! Tudo certo para a aula de amanhã?', timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), read: true },
      { id: 'm2', senderId: 'user_pedro', text: 'Oi professor! Tudo bem sim. Só tenho uma dúvida sobre estacionamento paralelo.', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), read: true },
      { id: 'm3', senderId: 'instructor_1', text: 'Ótimo! Vou trazer cones para praticarmos isso amanhã com calma.', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), read: true },
      { id: 'm4', senderId: 'user_pedro', text: 'Professor, posso adiantar a aula para as 14h hoje?', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), read: false },
    ],
  },
  {
    id: 'conv-ana',
    instructorId: 'instructor_1',
    studentId: 'user_ana',
    studentName: 'Ana Costa',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop',
    instructorName: 'Carlos Silva',
    instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
    messages: [
      { id: 'm5', senderId: 'instructor_1', text: 'Ana, sua aula de amanhã está confirmada às 9h no endereço combinado. Nos vemos lá!', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), read: true },
      { id: 'm6', senderId: 'user_ana', text: 'Olá! Confirmo presença para amanhã às 9h. Obrigada!', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), read: true },
    ],
  },
  {
    id: 'conv-student-instructor',
    instructorId: 'instructor_1',
    studentId: 'user_1',
    studentName: 'João Silva',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop',
    instructorName: 'Carlos Silva',
    instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
    messages: [
      { id: 'm7', senderId: 'instructor_1', text: 'Olá João! Sua aula está confirmada para hoje às 16h. Nos vemos em breve!', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: true },
      { id: 'm8', senderId: 'user_1', text: 'Ótimo professor! Estarei no endereço combinado. Obrigado!', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), read: true },
      { id: 'm9', senderId: 'instructor_1', text: 'Perfeito! Até logo.', timestamp: new Date(Date.now() - 88 * 60 * 1000).toISOString(), read: false },
    ],
  },
];

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem('cartaon_chat');
        if (saved) setConversations(JSON.parse(saved));
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem('cartaon_chat', JSON.stringify(conversations));
      } catch {}
    };
    save();
  }, [conversations]);

  const getMyConversations = useCallback(() => {
    if (!user) return [];
    if (user.role === 'instructor') return conversations.filter(c => c.instructorId === 'instructor_1');
    return conversations.filter(c => c.studentId === user.id);
  }, [conversations, user]);

  const sendMessage = useCallback((conversationId, text) => {
    if (!user || !text.trim()) return;
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== conversationId) return conv;
        return {
          ...conv,
          messages: [...conv.messages, {
            id: `m-${Date.now()}`,
            senderId: user.id,
            text: text.trim(),
            timestamp: new Date().toISOString(),
            read: false,
          }],
        };
      })
    );
  }, [user]);

  const markConversationAsRead = useCallback((conversationId) => {
    if (!user) return;
    setConversations(prev =>
      prev.map(conv =>
        conv.id !== conversationId ? conv : {
          ...conv,
          messages: conv.messages.map(msg => ({ ...msg, read: true })),
        }
      )
    );
  }, [user]);

  const getUnreadCount = useCallback((conversationId) => {
    if (!user) return 0;
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return 0;
    return conv.messages.filter(msg => !msg.read && msg.senderId !== user.id).length;
  }, [conversations, user]);

  const getTotalUnreadCount = useCallback(() => {
    return getMyConversations().reduce((total, conv) => total + getUnreadCount(conv.id), 0);
  }, [getMyConversations, getUnreadCount]);

  return (
    <ChatContext.Provider value={{
      conversations: getMyConversations(),
      activeConversationId,
      setActiveConversationId,
      sendMessage,
      markConversationAsRead,
      getUnreadCount,
      getTotalUnreadCount,
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
