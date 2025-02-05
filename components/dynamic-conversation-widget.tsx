'use client';

import { useEffect, useState } from "react";
import React from "react";
import { Phone } from "lucide-react";
import { useConversation } from "@11labs/react";

interface Scenario {
  title: string;
  customerBackground: string;
  situation: string;
  description: string;
}

interface DynamicConversationWidgetProps {
  scenario: Scenario;
  userName: string;
}

export function DynamicConversationWidget({ scenario, userName }: DynamicConversationWidgetProps) {
  const [started, setStarted] = useState(false);
  
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => {
      console.log("Disconnected");
      setStarted(false);
    },
    onMessage: (message: any) => console.log("Message:", message),
    onError: (error: Error) => console.error("Error:", error),
  });

  const handleStartConversation = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Fetch the signed URL from the API endpoint
      const response = await fetch("/api/elevenlabs/signed-url");
      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`);
      }
      const { signedUrl } = await response.json();
      console.log("Signed URL received:", signedUrl);

      // Build context text with scenario details
      const contextText = `Title: ${scenario.title}
Background: ${scenario.customerBackground}
Situation: ${scenario.situation}
Details: ${scenario.description}`;

      // Start conversation using the proper overrides format
      await conversation.startSession({
        signedUrl,
        overrides: {
          agent: {
            prompt: { prompt: contextText },
            firstMessage: `Hello ${userName}, I'm your CEO. Let's begin our conversation.`
          }
        }
      });
      console.log("Dynamic conversation started successfully");
      setStarted(true);
    } catch (error) {
      console.error("Error initializing dynamic conversation:", error);
    }
  };

  const handleStopConversation = async () => {
    try {
      await conversation.endSession();
      console.log("Conversation ended");
      setStarted(false);
    } catch (error) {
      console.error("Error ending conversation:", error);
    }
  };

  // Render a rounded transparent button with blue border that includes a phone icon and label.
  // When clicked, it triggers the call start or stop.
  return (
    <>
      {!started ? (
        <button
          onClick={handleStartConversation}
          className="rounded-full border border-blue-800 bg-transparent hover:bg-blue-50 px-4 py-2 flex items-center gap-2 text-blue-800"
        >
          <Phone className="w-5 h-5" />
          <span className="text-sm font-medium">Start a Call</span>
        </button>
      ) : (
        <button
          onClick={handleStopConversation}
          className="rounded-full border border-red-800 bg-transparent hover:bg-red-50 px-4 py-2 flex items-center gap-2 text-red-800"
        >
          <Phone className="w-5 h-5" />
          <span className="text-sm font-medium">Stop Call</span>
        </button>
      )}
    </>
  );
}
