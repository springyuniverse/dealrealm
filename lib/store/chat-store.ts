"use client";

import { create } from "zustand";
import { Message, Analysis } from "@/types";

interface ChatState {
  // Session Control
  timer: number;
  questionCount: number;
  isComplete: boolean;
  scenarioId: string | null;
  
  // Chat State
  messages: Message[];
  currentAnalysis: Analysis | null;
  
  // Methods
  startSession: (scenarioId: string) => void;
  endSession: () => void;
  incrementQuestionCount: () => void;
  updateTimer: (time: number) => void;
  addMessage: (message: Message) => void;
  setCurrentAnalysis: (analysis: Analysis) => void;
  resetSession: () => void;
}

const initialState = {
  timer: 0,
  questionCount: 0,
  isComplete: false,
  scenarioId: null,
  messages: [],
  currentAnalysis: null,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  startSession: (scenarioId: string) =>
    set({
      scenarioId,
      isComplete: false,
      timer: 0,
      questionCount: 0,
      messages: [],
      currentAnalysis: null,
    }),

  endSession: () =>
    set((state) => ({
      isComplete: true,
    })),

  incrementQuestionCount: () =>
    set((state) => ({
      questionCount: state.questionCount + 1,
    })),

  updateTimer: (time: number) =>
    set({
      timer: time,
    }),

  addMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setCurrentAnalysis: (analysis: Analysis) =>
    set({
      currentAnalysis: analysis,
    }),

  resetSession: () =>
    set({
      ...initialState,
    }),
}));
