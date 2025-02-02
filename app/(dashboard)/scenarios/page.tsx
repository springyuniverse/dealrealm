"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Eye } from "lucide-react";
import { Scenario, getScenarios } from "@/lib/services/scenarios";

export default function ScenariosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);

  useEffect(() => {
    async function fetchScenarios() {
      try {
        const data = await getScenarios();
        setScenarios(data);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
      } finally {
        setLoadingScenarios(false);
      }
    }

    fetchScenarios();
  }, []);

  const handleRevealScenario = (scenarioId: string) => {
    router.push(`/scenarios/${scenarioId}/session`);
  };

  if (loadingScenarios) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black">Training Scenarios</h1>
      <div className="grid grid-cols-2 gap-6">
        {scenarios.map((scenario: Scenario) => (
          <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-black">{scenario.title}</CardTitle>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {scenario.difficulty}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-black mb-4">{scenario.description}</p>
              <div className="mb-4">
                <h4 className="font-medium mb-2 text-black">Success Metrics:</h4>
                <ul className="space-y-1">
                  {scenario.successMetrics.map((metric) => (
                    <li key={metric.id} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-black">{metric.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleRevealScenario(scenario.id)}
                className="w-full mt-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Reveal Scenario
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
