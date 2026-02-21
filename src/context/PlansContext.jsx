import React, { createContext, useContext, useReducer } from 'react';
import { initialPlans } from '../data/plansData';

const PlansContext = createContext(null);

const ADD_PLAN    = 'ADD_PLAN';
const UPDATE_PLAN = 'UPDATE_PLAN';
const TOGGLE_PLAN = 'TOGGLE_PLAN';
const PURCHASE_PLAN = 'PURCHASE_PLAN';

function generateId() {
  return `id_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function reducer(state, action) {
  switch (action.type) {
    case ADD_PLAN:
      return { ...state, instructorPlans: [...state.instructorPlans, action.plan] };

    case UPDATE_PLAN:
      return {
        ...state,
        instructorPlans: state.instructorPlans.map(p =>
          p.id === action.plan.id ? { ...p, ...action.plan } : p,
        ),
      };

    case TOGGLE_PLAN:
      return {
        ...state,
        instructorPlans: state.instructorPlans.map(p =>
          p.id === action.planId ? { ...p, isActive: !p.isActive } : p,
        ),
      };

    case PURCHASE_PLAN:
      return { ...state, purchases: [...state.purchases, action.purchase] };

    default:
      return state;
  }
}

const initialState = {
  instructorPlans: initialPlans,
  purchases: [],
};

export function PlansProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addPlan = (planData) => {
    const plan = {
      ...planData,
      id: generateId(),
      isActive: true,
      purchasedBy: 0,
    };
    dispatch({ type: ADD_PLAN, plan });
    return plan;
  };

  const updatePlan = (plan) => dispatch({ type: UPDATE_PLAN, plan });

  const togglePlan = (planId) => dispatch({ type: TOGGLE_PLAN, planId });

  const purchasePlan = ({ plan, instructor, paymentMethod }) => {
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + plan.validityDays);

    const purchase = {
      id: generateId(),
      planId: plan.id,
      instructorId: plan.instructorId,
      instructorName: instructor.name,
      planName: plan.name,
      classesTotal: plan.classCount,
      classesUsed: 0,
      purchasedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      status: 'active',
      paymentMethod,
      price: plan.price,
    };
    dispatch({ type: PURCHASE_PLAN, purchase });

    // Increment purchasedBy count
    dispatch({ type: UPDATE_PLAN, plan: { id: plan.id, purchasedBy: plan.purchasedBy + 1 } });

    return purchase;
  };

  const getInstructorPlans = (instructorId) =>
    state.instructorPlans.filter(p => p.instructorId === instructorId);

  const getActivePlans = (instructorId) =>
    state.instructorPlans.filter(p => p.instructorId === instructorId && p.isActive);

  const getUserPurchases = () => state.purchases;

  return (
    <PlansContext.Provider value={{
      instructorPlans: state.instructorPlans,
      purchases: state.purchases,
      addPlan,
      updatePlan,
      togglePlan,
      purchasePlan,
      getInstructorPlans,
      getActivePlans,
      getUserPurchases,
    }}>
      {children}
    </PlansContext.Provider>
  );
}

export function usePlans() {
  const ctx = useContext(PlansContext);
  if (!ctx) throw new Error('usePlans must be used inside PlansProvider');
  return ctx;
}
