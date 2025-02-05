"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Eye, Users } from "lucide-react";
import { Scenario, getScenarios } from "@/lib/services/scenarios";
import { getUserTeams } from "@/lib/services/teams";
import { Team } from "@/types";

export default function ScenariosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [loadingScenarios, setLoadingScenarios] = useState(true);

  useEffect(() => {
    async function fetchTeams() {
      if (user) {
        try {
          const teamsData = await getUserTeams(user.uid);
          setTeams(teamsData);
          if (teamsData.length > 0) {
            setSelectedTeam(teamsData[0].id);
            console.log("Selected team:", teamsData[0].id);
          }
        } catch (error) {
          console.error("Error fetching teams:", error);
        }
      }
    }
    fetchTeams();
  }, [user]);

  useEffect(() => {
    async function fetchScenarios() {
      if (user && selectedTeam) {
        try {
          const data = await getScenarios(selectedTeam);
          setScenarios(data);
        } catch (error) {
          console.error("Error fetching scenarios:", error);
        } finally {
          setLoadingScenarios(false);
        }
      }
    }

    if (selectedTeam) {
      fetchScenarios();
    }
  }, [user, selectedTeam]);

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

  if (teams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No Teams Available</h2>
          <p className="text-gray-600">You need to be part of a team to access scenarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Training Scenarios</h1>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="px-4 py-2 border rounded-lg text-black"
        >
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      {scenarios.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Scenarios Available</h2>
          <p className="text-gray-600">There are no scenarios available for your team at the moment.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
