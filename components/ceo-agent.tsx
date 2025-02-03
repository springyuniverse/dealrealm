'use client';

import { useConversation } from "@11labs/react";
import { useCallback, useEffect } from "react";
import { Button } from "./ui/button";

interface Scenario {
  title: string;
  customerBackground: string;
  situation: string;
  description: string;
}

interface CeoAgentProps {
  scenario: Scenario;
  userName: string;
}

export function CeoAgent({ scenario, userName }: CeoAgentProps) {
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message: any) => console.log("Message:", message),
    onError: (error: Error) => console.error("Error:", error),
  });

  // Debug: Log conversation status changes
  useEffect(() => {
    console.log("Conversation status:", conversation.status);
  }, [conversation.status]);

  const getSignedUrl = async (): Promise<string> => {
    const response = await fetch("/api/elevenlabs/signed-url");
    if (!response.ok) {
      throw new Error(`Failed to get signed url: ${response.statusText}`);
    }
    const { signedUrl } = await response.json();
    return signedUrl;
  };

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const signedUrl = await getSignedUrl();
      console.log("Signed URL received:", signedUrl);

      // Build context text with scenario details
      const contextText = `Title: ${scenario.title}
      Background: ${scenario.customerBackground}
      Situation: ${scenario.situation}
      Details: ${scenario.description}`;

      // Start conversation using the proper overrides format per ElevenLabs SDK:
      // Agent overrides: prompt (for detailed context) and firstMessage (greeting)
      await conversation.startSession({
        signedUrl,
        overrides: {
          agent: {
            prompt: { prompt: contextText },
            firstMessage: `Hello ${userName}, I'm your CEO. Let's discuss your scenario.`
          }
        }
      });
      console.log("Conversation started successfully");
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation, scenario, userName]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    console.log("Conversation ended");
  }, [conversation]);

  const reconnect = useCallback(async () => {
    console.log("Attempting to reconnect...");
    await stopConversation();
    await startConversation();
  }, [startConversation, stopConversation]);

  // Removed auto-start to allow manual control.
  useEffect(() => {
    // Monitor conversation status if needed.
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <Button
          onClick={startConversation}
          disabled={conversation.status === "connected"}
          variant="default"
        >
          Start Conversation
        </Button>
        <Button
          onClick={stopConversation}
          disabled={conversation.status !== "connected"}
          variant="destructive"
        >
          Stop Conversation
        </Button>
        <Button onClick={reconnect} variant="default">
          Reconnect
        </Button>
      </div>
      <div className="flex flex-col items-center">
        <p>Status: {conversation.status}</p>
        <p>Agent is {conversation.isSpeaking ? "speaking" : "listening"}</p>
      </div>
    </div>
  );
}
