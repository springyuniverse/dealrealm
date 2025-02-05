"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withAdmin } from "@/lib/auth/with-admin";
import { createScenario } from "@/lib/services/scenarios";
import { getUserTeams, getTeamGroups } from "@/lib/services/teams";
import { Team, Group } from "@/types";
import { Plus, Trash2 } from "lucide-react";

interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  weight: number;
  keyPhrases?: string[];
  criteria: string[];
}

function CreateScenarioPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customerBackground, setCustomerBackground] = useState("");
  const [situation, setSituation] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [timeLimit, setTimeLimit] = useState(30);
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [successMetrics, setSuccessMetrics] = useState<SuccessMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const teamsData = await getUserTeams("");
        setTeams(teamsData);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    }
    fetchTeams();
  }, []);

  useEffect(() => {
    async function fetchGroups() {
      if (selectedTeam) {
        try {
          const groupsData = await getTeamGroups(selectedTeam);
          setGroups(groupsData);
        } catch (error) {
          console.error("Error fetching groups:", error);
        }
      } else {
        setGroups([]);
      }
    }
    fetchGroups();
  }, [selectedTeam]);

  const handleAddMetric = () => {
    const newMetric: SuccessMetric = {
      id: Math.random().toString(36).substring(7),
      name: "",
      description: "",
      weight: 1,
      keyPhrases: [],
      criteria: []
    };
    setSuccessMetrics([...successMetrics, newMetric]);
  };

  const handleRemoveMetric = (id: string) => {
    setSuccessMetrics(successMetrics.filter(metric => metric.id !== id));
  };

  const handleMetricChange = (id: string, field: keyof SuccessMetric, value: any) => {
    setSuccessMetrics(successMetrics.map(metric => 
      metric.id === id ? { ...metric, [field]: value } : metric
    ));
  };

  const handleAddKeyPhrase = (metricId: string) => {
    setSuccessMetrics(successMetrics.map(metric => 
      metric.id === metricId ? {
        ...metric,
        keyPhrases: [...(metric.keyPhrases || []), ""]
      } : metric
    ));
  };

  const handleRemoveKeyPhrase = (metricId: string, index: number) => {
    setSuccessMetrics(successMetrics.map(metric => 
      metric.id === metricId ? {
        ...metric,
        keyPhrases: metric.keyPhrases?.filter((_, i) => i !== index)
      } : metric
    ));
  };

  const handleKeyPhraseChange = (metricId: string, index: number, value: string) => {
    setSuccessMetrics(successMetrics.map(metric => 
      metric.id === metricId ? {
        ...metric,
        keyPhrases: metric.keyPhrases?.map((phrase, i) => 
          i === index ? value : phrase
        )
      } : metric
    ));
  };

  const handleAddCriterion = (metricId: string) => {
    setSuccessMetrics(successMetrics.map(metric => 
      metric.id === metricId ? {
        ...metric,
        criteria: [...metric.criteria, ""]
      } : metric
    ));
  };

  const handleRemoveCriterion = (metricId: string, index: number) => {
    setSuccessMetrics(successMetrics.map(metric => 
      metric.id === metricId ? {
        ...metric,
        criteria: metric.criteria.filter((_, i) => i !== index)
      } : metric
    ));
  };

  const handleCriterionChange = (metricId: string, index: number, value: string) => {
    setSuccessMetrics(successMetrics.map(metric => 
      metric.id === metricId ? {
        ...metric,
        criteria: metric.criteria.map((criterion, i) => 
          i === index ? value : criterion
        )
      } : metric
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !selectedTeam) return;

    setLoading(true);
    try {
      await createScenario({
        title,
        teamId: selectedTeam,
        description,
        customerBackground,
        situation,
        difficulty,
        timeLimit,
        maxQuestions,
        successMetrics,
        isActive: false,
        visibleToGroups: selectedGroups
      });
      router.push("/admin/scenarios");
    } catch (error) {
      console.error("Error creating scenario:", error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">Create New Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-1 text-black">Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                required
                className="w-full p-2 border rounded-lg text-black"
              >
                <option value="">Select a team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            {selectedTeam && (
              <div>
                <label className="block font-medium mb-1 text-black">Visible to Groups</label>
                <div className="space-y-2">
                  {groups.map(group => (
                    <label key={group.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGroups([...selectedGroups, group.id]);
                          } else {
                            setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-black">{group.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block font-medium mb-1 text-black">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 border rounded-lg text-black"
                placeholder="Enter scenario title"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-black">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-2 border rounded-lg h-24 text-black"
                placeholder="Enter scenario description"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-black">Customer Background</label>
              <textarea
                value={customerBackground}
                onChange={(e) => setCustomerBackground(e.target.value)}
                required
                className="w-full p-2 border rounded-lg h-24 text-black"
                placeholder="Enter customer background"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-black">Current Situation</label>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                required
                className="w-full p-2 border rounded-lg h-24 text-black"
                placeholder="Enter current situation"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-1 text-black">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as "beginner" | "intermediate" | "advanced")}
                  required
                  className="w-full p-2 border rounded-lg text-black"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 text-black">Time Limit (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  required
                  className="w-full p-2 border rounded-lg text-black"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-black">Max Questions</label>
                <input
                  type="number"
                  min="1"
                  value={maxQuestions}
                  onChange={(e) => setMaxQuestions(parseInt(e.target.value))}
                  required
                  className="w-full p-2 border rounded-lg text-black"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block font-medium text-black">Success Metrics</label>
                <button
                  type="button"
                  onClick={handleAddMetric}
                  className="px-3 py-1 bg-blue-800 text-white rounded-lg hover:bg-blue-900 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Metric
                </button>
              </div>

              <div className="space-y-6">
                {successMetrics.map((metric, index) => (
                  <div key={metric.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-black">Metric {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveMetric(metric.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-black">Name</label>
                        <input
                          type="text"
                          value={metric.name}
                          onChange={(e) => handleMetricChange(metric.id, 'name', e.target.value)}
                          required
                          className="w-full p-2 border rounded-lg text-black"
                          placeholder="Enter metric name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-black">Description</label>
                        <textarea
                          value={metric.description}
                          onChange={(e) => handleMetricChange(metric.id, 'description', e.target.value)}
                          required
                          className="w-full p-2 border rounded-lg h-20 text-black"
                          placeholder="Enter metric description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-black">Weight (1-5)</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={metric.weight}
                          onChange={(e) => handleMetricChange(metric.id, 'weight', parseInt(e.target.value))}
                          required
                          className="w-full p-2 border rounded-lg text-black"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-black">Key Phrases (Optional)</label>
                          <button
                            type="button"
                            onClick={() => handleAddKeyPhrase(metric.id)}
                            className="text-sm text-blue-800 hover:text-blue-900"
                          >
                            + Add Phrase
                          </button>
                        </div>
                        {metric.keyPhrases?.map((phrase, phraseIndex) => (
                          <div key={phraseIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={phrase}
                              onChange={(e) => handleKeyPhraseChange(metric.id, phraseIndex, e.target.value)}
                              className="flex-1 p-2 border rounded-lg text-black"
                              placeholder="Enter key phrase"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyPhrase(metric.id, phraseIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-black">Success Criteria</label>
                          <button
                            type="button"
                            onClick={() => handleAddCriterion(metric.id)}
                            className="text-sm text-blue-800 hover:text-blue-900"
                          >
                            + Add Criterion
                          </button>
                        </div>
                        {metric.criteria.map((criterion, criterionIndex) => (
                          <div key={criterionIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={criterion}
                              onChange={(e) => handleCriterionChange(metric.id, criterionIndex, e.target.value)}
                              required
                              className="flex-1 p-2 border rounded-lg text-black"
                              placeholder="Enter success criterion"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCriterion(metric.id, criterionIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border text-black rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedTeam}
                className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Scenario"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAdmin(CreateScenarioPage);
