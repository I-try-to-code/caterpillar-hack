import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TelemetryState, TelemetryAction } from '../types/telemetry';
import { initialTelemetryState } from '../data/telemetry';

function telemetryReducer(state: TelemetryState, action: TelemetryAction): TelemetryState {
  switch (action.type) {
    case 'SET_TELEMETRY':
      return { ...action.payload };
    case 'UPDATE_TELEMETRY':
      return { ...state, ...action.payload };
    case 'RESET_TELEMETRY':
      return { ...initialTelemetryState };
    default:
      return state;
  }
}

export interface TelemetryContextType {
  telemetry: TelemetryState;
  dispatch: React.Dispatch<TelemetryAction>;
  setTelemetry: (state: TelemetryState) => void;
  updateTelemetry: (partial: Partial<TelemetryState>) => void;
  resetTelemetry: () => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export interface TelemetryProviderProps {
  children: ReactNode;
  initialState?: TelemetryState;
}

export const TelemetryProvider: React.FC<TelemetryProviderProps> = ({
  children,
  initialState = initialTelemetryState,
}) => {
  const [telemetry, dispatch] = useReducer(telemetryReducer, initialState);

  const setTelemetry = (state: TelemetryState) => {
    dispatch({ type: 'SET_TELEMETRY', payload: state });
  };

  const updateTelemetry = (partial: Partial<TelemetryState>) => {
    dispatch({ type: 'UPDATE_TELEMETRY', payload: partial });
  };

  const resetTelemetry = () => {
    dispatch({ type: 'RESET_TELEMETRY' });
  };

  const value: TelemetryContextType = {
    telemetry,
    dispatch,
    setTelemetry,
    updateTelemetry,
    resetTelemetry,
  };

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
};

export function useTelemetry(): TelemetryContextType {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}
