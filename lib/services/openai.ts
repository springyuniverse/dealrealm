import OpenAI from 'openai';
import { Message, Scenario } from '@/types';
import type { 
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionAssistantMessageParam 
} from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatResponse(
  messages: Message[],
  scenario: Scenario
) {
  try {
    const systemPrompt = `You are the CEO of a company in a sales meeting. Here's your context:

You are:
- The CEO of a company with the following background:
${scenario.customerBackground}

Current Situation:
${scenario.situation}

Your role:
- Stay in character as the CEO throughout the conversation
- Be realistic, busy, and appropriately skeptical
- Ask challenging questions about their solution
- Show interest if they make compelling points
- Express concerns if they don't address your needs
- Don't evaluate or analyze their responses directly - that's handled separately
- Keep responses concise and focused

Remember: You are the CEO making a buying decision, not an evaluator. Respond naturally as a CEO would in this situation.`;

    const systemMessage: ChatCompletionSystemMessageParam = {
      role: 'system',
      content: systemPrompt
    };

    const messageHistory: (ChatCompletionUserMessageParam | ChatCompletionAssistantMessageParam)[] = 
      messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

    const formattedMessages: ChatCompletionMessageParam[] = [
      systemMessage,
      ...messageHistory
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0].message?.content || '';
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
}

export async function analyzeResponse(
  message: string,
  scenario: Scenario
) {
  try {
    const metricsSection = scenario.successMetrics.map(metric => 
      `${metric.name} (Weight: ${metric.weight}):
${metric.description}`
    ).join('\n\n');

    const analysisPrompt = `Analyze my repsonse in 3 clear sentences and provide a score out of 100.

My Message: "${message}"

Company Context:
${scenario.customerBackground}

Current Situation:
${scenario.situation}

Success Metrics:
${metricsSection}

Provide your analysis as a JSON object with two fields:
1. "feedback": An array of exactly 3 sentences analyzing the response
2. "score": A number from 0-100 representing overall effectiveness

Example format:
{
  "feedback": [
    "First observation about the response.",
    "Second point about effectiveness.",
    "Third point with suggestion for improvement."
  ],
  "score": 75
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: 'system', 
          content: 'You are a sales coach providing concise, actionable feedback.'
        },
        { 
          role: 'user', 
          content: analysisPrompt 
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = completion.choices[0].message?.content || '{}';
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleanedContent);
    
    if (!analysis.feedback || !Array.isArray(analysis.feedback) || typeof analysis.score !== 'number') {
      return {
        feedback: [
          "Unable to analyze the response.",
          "Please try being more specific in your pitch.",
          "Focus on addressing the company's needs directly."
        ],
        score: 0
      };
    }
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing response:', error);
    return {
      feedback: [
        "Unable to analyze the response.",
        "Please try being more specific in your pitch.",
        "Focus on addressing the company's needs directly."
      ],
      score: 0
    };
  }
}
