'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Analysis {
  score: number;
  feedback: string[];
}

interface ChatHistoryProps {
  messages: Message[];
  analysis: Analysis | null;
  isTyping: boolean;
  onNewMessage?: (message: Message) => void;
}

export function ChatHistory({ messages, analysis, isTyping, onNewMessage }: ChatHistoryProps) {
  // Listen for messages from ElevenLabs and add them to the chat history
  useEffect(() => {
    const handleElevenLabsMessage = (event: any) => {
      if (event.detail?.type === 'message' && event.detail?.content) {
        const newMessage: Message = {
          role: 'assistant',
          content: event.detail.content,
          timestamp: new Date()
        };
        onNewMessage?.(newMessage);
      }
    };

    // Listen for custom events from the ElevenLabs widget
    window.addEventListener('elevenlabs-message', handleElevenLabsMessage);

    return () => {
      window.removeEventListener('elevenlabs-message', handleElevenLabsMessage);
    };
  }, [onNewMessage]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <CardTitle className="text-black">Chat History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`mb-4 ${
                  message.role === "user"
                    ? "ml-auto max-w-md bg-blue-100 p-3 rounded-lg"
                    : "mr-auto max-w-md bg-white p-3 rounded-lg shadow"
                }`}
              >
                <p className="text-gray-800">{message.content}</p>
              </div>
              {message.role === "user" && analysis && index === messages.length - 1 && (
                <div className="mb-4 max-w-md ml-auto">
                  <div className="text-xs text-right mb-1">
                    <span className="text-green-600 font-medium">
                      Score: {analysis.score}/100
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="mr-auto max-w-md bg-white p-3 rounded-lg shadow animate-pulse">
              <p className="text-gray-400">CEO is typing...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
