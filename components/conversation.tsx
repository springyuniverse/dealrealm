'use client';

import React, { useEffect } from "react";

export function Conversation() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://elevenlabs.io/convai-widget/index.js";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Instead of using JSX directly for the custom element (which causes TS errors),
  // we create the element via React.createElement.
  return React.createElement("elevenlabs-convai", { "agent-id": "Dx3gJ4TcAfCOMeOEcjmW" });
}
