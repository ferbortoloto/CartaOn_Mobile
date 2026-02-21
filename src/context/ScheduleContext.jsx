import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialContacts, initialEvents, generateId } from '../data/scheduleData';

const ScheduleContext = createContext();

const ACTIONS = {
  ADD_CONTACT: 'ADD_CONTACT',
  UPDATE_CONTACT: 'UPDATE_CONTACT',
  DELETE_CONTACT: 'DELETE_CONTACT',
  ADD_EVENT: 'ADD_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  SET_SELECTED_DATE: 'SET_SELECTED_DATE',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_FILTER: 'SET_FILTER',
  LOAD_DATA: 'LOAD_DATA',
};

const initialState = {
  contacts: initialContacts,
  events: initialEvents,
  selectedDate: new Date(),
  viewMode: 'month',
  filters: { eventType: 'all', priority: 'all', status: 'all' },
};

const scheduleReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOAD_DATA:
      return { ...state, contacts: action.payload.contacts, events: action.payload.events };
    case ACTIONS.ADD_CONTACT:
      return { ...state, contacts: [...state.contacts, { ...action.payload, id: generateId() }] };
    case ACTIONS.UPDATE_CONTACT:
      return {
        ...state,
        contacts: state.contacts.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload, updatedAt: new Date().toISOString() } : c
        ),
      };
    case ACTIONS.DELETE_CONTACT:
      return {
        ...state,
        contacts: state.contacts.filter(c => c.id !== action.payload),
        events: state.events.map(e => e.contactId === action.payload ? { ...e, contactId: null } : e),
      };
    case ACTIONS.ADD_EVENT:
      return { ...state, events: [...state.events, { ...action.payload, id: generateId() }] };
    case ACTIONS.UPDATE_EVENT:
      return {
        ...state,
        events: state.events.map(e =>
          e.id === action.payload.id ? { ...e, ...action.payload, updatedAt: new Date().toISOString() } : e
        ),
      };
    case ACTIONS.DELETE_EVENT:
      return { ...state, events: state.events.filter(e => e.id !== action.payload) };
    case ACTIONS.SET_SELECTED_DATE:
      return { ...state, selectedDate: action.payload };
    case ACTIONS.SET_VIEW_MODE:
      return { ...state, viewMode: action.payload };
    case ACTIONS.SET_FILTER:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
};

export const ScheduleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await AsyncStorage.getItem('scheduleData');
        if (saved) {
          const parsed = JSON.parse(saved);
          dispatch({ type: ACTIONS.LOAD_DATA, payload: parsed });
        }
      } catch (error) {
        console.error('Erro ao carregar agenda:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('scheduleData', JSON.stringify({
          contacts: state.contacts,
          events: state.events,
        }));
      } catch (error) {
        console.error('Erro ao salvar agenda:', error);
      }
    };
    saveData();
  }, [state.contacts, state.events]);

  const addContact = (contact) => {
    const newContact = { ...contact, id: generateId() };
    dispatch({ type: ACTIONS.ADD_CONTACT, payload: contact });
    return newContact;
  };
  const updateContact = (contact) => dispatch({ type: ACTIONS.UPDATE_CONTACT, payload: contact });
  const deleteContact = (id) => dispatch({ type: ACTIONS.DELETE_CONTACT, payload: id });
  const addEvent = (event) => dispatch({ type: ACTIONS.ADD_EVENT, payload: event });
  const updateEvent = (event) => dispatch({ type: ACTIONS.UPDATE_EVENT, payload: event });
  const deleteEvent = (id) => dispatch({ type: ACTIONS.DELETE_EVENT, payload: id });
  const setSelectedDate = (date) => dispatch({ type: ACTIONS.SET_SELECTED_DATE, payload: date });
  const setViewMode = (mode) => dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: mode });
  const setFilter = (filter) => dispatch({ type: ACTIONS.SET_FILTER, payload: filter });

  const getContactById = (id) => state.contacts.find(c => c.id === id);
  const getEventsForDate = (date) => {
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const next = new Date(target);
    next.setDate(next.getDate() + 1);
    return state.events.filter(e => {
      const d = new Date(e.startDateTime);
      return d >= target && d < next;
    });
  };
  const getFilteredEvents = () =>
    state.events.filter(e => {
      if (state.filters.eventType !== 'all' && e.type !== state.filters.eventType) return false;
      if (state.filters.priority !== 'all' && e.priority !== state.filters.priority) return false;
      if (state.filters.status !== 'all' && e.status !== state.filters.status) return false;
      return true;
    });

  const value = {
    ...state,
    addContact, updateContact, deleteContact,
    addEvent, updateEvent, deleteEvent,
    setSelectedDate, setViewMode, setFilter,
    getContactById, getEventsForDate, getFilteredEvents,
  };

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
};

export const useSchedule = () => {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
};
