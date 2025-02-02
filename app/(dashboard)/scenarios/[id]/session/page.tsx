"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Send, 
  Brain, 
  Timer, 
  Eye, 
  EyeOff,
  ArrowLeft,
  MessageCircle
} from "lucide-react";
import { Scenario, getScenarioById } from "@/lib/services/scenarios";

import { Message } from "@/types";

interface Props {
  params: {
    id: string;
  };
}

export default function ChatSessionPage({ params }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [showScenario, setShowScenario] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loadingScenario, setLoadingScenario] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchScenario() {
      try {
        const data = await getScenarioById(params.id);
        setScenario(data);
      } catch (error) {
        console.error("Error fetching scenario:", error);
        router.replace("/scenarios");
      } finally {
        setLoadingScenario(false);
      }
    }

    if (user) {
      fetchScenario();
    }
  }, [user, params.id, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (sessionStarted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSession = async () => {
    setSessionStarted(true);
    setQuestionCount(1);
    
    try {
      const initialMessage: Message = {
        role: "assistant",
        content: "Hello, it a pleassure to have you, I'm interested in hearing how your solution can help us. Please proceed with your pitch.",
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !scenario) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: userInput,
      timestamp: new Date()
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setUserInput("");
    setIsTyping(true);
    setQuestionCount(prev => prev + 1);

    try {
      // Get AI response and analysis in parallel
      const [chatResponse, analysisResponse] = await Promise.all([
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages,
            scenarioId: scenario.id,
            action: 'chat'
          })
        }),
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [userMessage],
            scenarioId: scenario.id,
            action: 'analyze'
          })
        })
      ]);

      const [chatData, analysisData] = await Promise.all([
        chatResponse.json(),
        analysisResponse.json()
      ]);

      // Update messages and analysis together
      if (chatData.response && analysisData.analysis) {
        const aiMessage: Message = {
          role: "assistant",
          content: chatData.response,
          timestamp: new Date()
        };
        setMessages([...updatedMessages, aiMessage]);
        setAnalysis(analysisData.analysis);
      }
    } catch (error) {
      console.error('Error in chat:', error);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading || loadingScenario) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || !scenario) return null;

  if (!sessionStarted) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-black">{scenario.title}</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-black">Scenario Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2 text-black">Description:</h3>
                  <div className="whitespace-pre-wrap text-gray-600">{scenario.description}</div>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2 text-black">Customer Background:</h3>
                  <div className="whitespace-pre-wrap text-gray-600">{scenario.customerBackground}</div>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2 text-black">Situation:</h3>
                  <div className="whitespace-pre-wrap text-gray-600">{scenario.situation}</div>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2 text-black">Success Metrics:</h3>
                  <ul className="list-disc pl-4 space-y-2">
                    {scenario.successMetrics.map((metric) => (
                      <li key={metric.id} className="text-gray-600">
                        <span className="font-medium">{metric.name}</span>
                        <p className="mt-1">{metric.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-16 h-16 text-blue-800 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4 text-black">Ready to Start Your Sales Pitch?</h2>
            <p className="text-gray-600 mb-6">
              You are a salesperson meeting with the CEO. Review the scenario details and prepare your pitch carefully.
            </p>
            <button
              onClick={handleStartSession}
              className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 flex items-center gap-2 mx-auto"
            >
              <MessageCircle className="w-5 h-5" />
              Start Session with CEO
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/scenarios")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Scenarios
          </button>
          <button
            onClick={() => setShowScenario(!showScenario)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
          >
            {showScenario ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Scenario
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                View Scenario
              </>
            )}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-lg">
            <Timer className="w-4 h-4 text-blue-800" />
            <span className="font-medium text-black">{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-lg">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-black">Questions: {questionCount}</span>
          </div>
        </div>
      </div>

      {showScenario && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-black">Scenario Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2 text-black">Description:</h3>
                  <div className="whitespace-pre-wrap text-gray-600">{scenario.description}</div>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2 text-black">Customer Background:</h3>
                  <div className="whitespace-pre-wrap text-gray-600">{scenario.customerBackground}</div>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2 text-black">Situation:</h3>
                  <div className="whitespace-pre-wrap text-gray-600">{scenario.situation}</div>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2 text-black">Success Metrics:</h3>
                  <ul className="list-disc pl-4 space-y-2">
                    {scenario.successMetrics.map((metric) => (
                      <li key={metric.id} className="text-gray-600">
                        <span className="font-medium">{metric.name}</span>
                        <p className="mt-1">{metric.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <CardTitle className="text-black">Meeting with CEO</CardTitle>
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your sales pitch or response..."
                  className="flex-1 p-2 border rounded-lg text-gray-800 placeholder:text-gray-400"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1">
          {messages.length > 1 && (
            <Card className="bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-green-800">Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {messages.some(m => m.role === "user") && analysis && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-800 mb-2">Feedback:</h4>
                      <ul className="list-disc pl-4">
                        {analysis.feedback.map((feedback: string, index: number) => (
                          <li key={index} className="text-green-700 text-sm mb-2">{feedback}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-green-800">Score:</h4>
                        <span className="text-green-700 font-bold text-lg">{analysis.score}/100</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
