"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";

export * from './schema';
import { AppState, Block, AuditEvent } from './schema';
import { generateSyntheticData } from './generator';

const initialState: AppState = generateSyntheticData();

type Action = 
  | { type: "LOAD_STATE"; payload: AppState }
  | { type: "SELECT_TASK_FOR_PLANNING"; payload: string }
  | { type: "DESELECT_TASK_FOR_PLANNING"; payload: string }
  | { type: "OPTIMIZE_BLOCK"; payload: Block }
  | { type: "UPDATE_BLOCK_REQUEST"; payload: import('./schema').BlockRequest }
  | { type: "APPROVE_BLOCK"; payload: string }
  | { type: "HARVEST_TASKS"; payload: { blockId: string; taskIds: string[] } }
  | { type: "REMOVE_TASK_FROM_BLOCK"; payload: { blockId: string; taskId: string } }
  | { type: "ADD_AUDIT_EVENT"; payload: Omit<AuditEvent, "id" | "timestamp"> }
  | { type: "TRIGGER_EMERGENCY_REPLAN"; payload: string }
  | { type: "RESET_DEMO" }
  | { type: "ADD_NOTIFICATION"; payload: Omit<import('./schema').Notification, "id" | "timestamp" | "read"> }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "CLEAR_NOTIFICATIONS" };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_STATE":
      return {
        ...initialState,
        ...action.payload,
        assets: action.payload.assets || initialState.assets,
        tasks: action.payload.tasks || initialState.tasks,
        blockRequests: action.payload.blockRequests || initialState.blockRequests,
        blocks: action.payload.blocks || [],
        trainMovements: action.payload.trainMovements || initialState.trainMovements,
        crews: action.payload.crews || initialState.crews,
        equipment: action.payload.equipment || initialState.equipment,
        notifications: action.payload.notifications || initialState.notifications,
        auditLogs: action.payload.auditLogs || initialState.auditLogs,
        selectedTasksForPlanning: action.payload.selectedTasksForPlanning || []
      };

    case "ADD_NOTIFICATION": {
      const newNotif: import('./schema').Notification = {
        ...action.payload,
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      return {
        ...state,
        notifications: [newNotif, ...(state.notifications || [])]
      };
    }

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n)
      };

    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      };

    case "CLEAR_NOTIFICATIONS":
      return {
        ...state,
        notifications: []
      };
      
    case "SELECT_TASK_FOR_PLANNING":
      if (state.selectedTasksForPlanning.includes(action.payload)) return state;
      return {
        ...state,
        selectedTasksForPlanning: [...state.selectedTasksForPlanning, action.payload],
        tasks: state.tasks.map(t => t.id === action.payload ? { ...t, status: "SELECTED" } : t)
      };

    case "DESELECT_TASK_FOR_PLANNING":
      return {
        ...state,
        selectedTasksForPlanning: state.selectedTasksForPlanning.filter(id => id !== action.payload),
        tasks: state.tasks.map(t => t.id === action.payload ? { ...t, status: "PENDING" } : t)
      };

    case "OPTIMIZE_BLOCK":
      return {
        ...state,
        currentOptimizationResult: action.payload,
        blocks: [...state.blocks.filter(b => b.id !== action.payload.id), action.payload],
        selectedTasksForPlanning: []
      };

    case "UPDATE_BLOCK_REQUEST":
      return {
        ...state,
        blockRequests: state.blockRequests.map(r => r.id === action.payload.id ? action.payload : r)
      };

    case "APPROVE_BLOCK":
      return {
        ...state,
        blocks: state.blocks.map(b => b.id === action.payload ? { ...b, status: "APPROVED" } : b),
        currentOptimizationResult: state.currentOptimizationResult?.id === action.payload 
          ? { ...state.currentOptimizationResult, status: "APPROVED" } 
          : state.currentOptimizationResult,
        tasks: state.tasks.map(t => {
          const block = state.blocks.find(b => b.id === action.payload);
          if (block && (block.tasks.includes(t.id) || block.harvestedTasks.includes(t.id))) {
             return { ...t, status: block.harvestedTasks.includes(t.id) ? "HARVESTED" : "SCHEDULED" };
          }
          return t;
        })
      };

    case "HARVEST_TASKS": {
      const { blockId, taskIds } = action.payload;
      const block = state.blocks.find(b => b.id === blockId);
      if (!block) return state;

      const updatedBlock = {
        ...block,
        harvestedTasks: [...Array.from(new Set([...block.harvestedTasks, ...taskIds]))]
      };

      // Recalculate utilization
      let totalTime = 0;
      updatedBlock.tasks.forEach(tid => {
        const t = state.tasks.find(x => x.id === tid);
        if (t) totalTime += t.duration;
      });
      updatedBlock.harvestedTasks.forEach(tid => {
        const t = state.tasks.find(x => x.id === tid);
        if (t) totalTime += t.duration;
      });
      
      updatedBlock.utilization = Math.min(100, Math.round((totalTime / updatedBlock.durationMinutes) * 100));

      return {
        ...state,
        blocks: state.blocks.map(b => b.id === blockId ? updatedBlock : b),
        currentOptimizationResult: state.currentOptimizationResult?.id === blockId ? updatedBlock : state.currentOptimizationResult,
        tasks: state.tasks.map(t => taskIds.includes(t.id) ? { ...t, status: "HARVESTED" } : t)
      };
    }

    case "REMOVE_TASK_FROM_BLOCK": {
      const { blockId, taskId } = action.payload;
      const block = state.blocks.find(b => b.id === blockId);
      if (!block) return state;

      const isHarvested = block.harvestedTasks.includes(taskId);
      const updatedBlock = {
        ...block,
        tasks: block.tasks.filter(id => id !== taskId),
        harvestedTasks: block.harvestedTasks.filter(id => id !== taskId)
      };

      let totalTime = 0;
      [...updatedBlock.tasks, ...updatedBlock.harvestedTasks].forEach(tid => {
        const t = state.tasks.find(x => x.id === tid);
        if (t) totalTime += t.duration;
      });
      updatedBlock.utilization = Math.min(100, Math.round((totalTime / updatedBlock.durationMinutes) * 100));

      return {
        ...state,
        blocks: state.blocks.map(b => b.id === blockId ? updatedBlock : b),
        currentOptimizationResult: state.currentOptimizationResult?.id === blockId ? updatedBlock : state.currentOptimizationResult,
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: "PENDING" } : t)
      };
    }

    case "ADD_AUDIT_EVENT": {
      const newEvent: AuditEvent = {
        ...action.payload,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString()
      };
      return {
        ...state,
        auditLogs: [newEvent, ...state.auditLogs]
      };
    }

    case "TRIGGER_EMERGENCY_REPLAN":
      return {
        ...state,
        blocks: state.blocks.map(b => b.id === action.payload ? { ...b, status: "REPLANNED" } : b)
      };

    case "RESET_DEMO":
      return initialState;

    default:
      return state;
  }
}

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("railniyojak_state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        dispatch({ type: "LOAD_STATE", payload: parsed });
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("railniyojak_state", JSON.stringify(state));
    }
  }, [state, isLoaded]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
