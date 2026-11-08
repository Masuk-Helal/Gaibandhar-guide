"use client";

import { create } from "zustand";

export interface AssistantAction {
  id: string;
  label: string;
  href: string;
  kind: "category" | "place";
}

export interface AssistantMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  actions?: AssistantAction[];
}

interface AssistantState {
  open: boolean;
  messages: AssistantMessage[];
  setOpen: (open: boolean) => void;
  toggle: () => void;
  pushMessage: (message: Omit<AssistantMessage, "id">) => void;
  reset: () => void;
}

let sequence = 0;
const nextId = () => `assistant-${Date.now()}-${sequence++}`;

export const useAssistantStore = create<AssistantState>((set) => ({
  open: false,
  messages: [],
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
  pushMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, id: nextId() }].slice(-80),
    })),
  reset: () => set({ open: false, messages: [] }),
}));
