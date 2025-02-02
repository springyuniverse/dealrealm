import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse, analyzeResponse } from "@/lib/services/openai";
import { getScenarioById } from "@/lib/services/scenarios";
import { Message } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { messages, scenarioId, action } = await request.json();

    // Get scenario data
    const scenario = await getScenarioById(scenarioId);
    if (!scenario) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    if (action === 'chat') {
      // Generate chat response
      const response = await generateChatResponse(messages as Message[], scenario);
      return NextResponse.json({ response });
    } else if (action === 'analyze') {
      // Get last user message
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'user') {
        return NextResponse.json(
          { error: "No user message to analyze" },
          { status: 400 }
        );
      }

      try {
        // Analyze response
        const analysis = await analyzeResponse(lastMessage.content, scenario);
        
        // Log analysis for debugging
        console.log('Analysis result:', JSON.stringify(analysis, null, 2));
        
        return NextResponse.json({ 
          analysis,
          success: true
        });
      } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
          { error: "Failed to analyze response" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
