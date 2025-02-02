"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { withAdmin } from "@/lib/auth/with-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/init";
import { Scenario } from "@/lib/services/scenarios";

interface Props {
  params: {
    id: string;
  };
}

function EditScenarioPage({ params }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [description, setDescription] = useState("");
  const [customerBackground, setCustomerBackground] = useState("");
  const [situation, setSituation] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [successMetrics, setSuccessMetrics] = useState<{
    id: string;
    name: string;
    weight: number;
    criteria: string[];
    description: string;
    keyPhrases?: string[];
  }[]>([{
    id: crypto.randomUUID(),
    name: "",
    weight: 1,
    criteria: [],
    description: "",
    keyPhrases: []
  }]);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScenario() {
      try {
        const scenarioRef = doc(db, "scenarios", params.id);
        const scenarioSnap = await getDoc(scenarioRef);
        
        if (scenarioSnap.exists()) {
          const data = scenarioSnap.data() as Scenario;
          setTitle(data.title);
          setDifficulty(data.difficulty);
          setDescription(data.description);
          setCustomerBackground(data.customerBackground);
          setSituation(data.situation);
          setTimeLimit(data.timeLimit);
          setMaxQuestions(data.maxQuestions);
          setSuccessMetrics(data.successMetrics.map(metric => ({
            ...metric,
            id: metric.id || crypto.randomUUID()
          })));
          setIsActive(data.isActive);
        } else {
          router.replace("/admin/scenarios");
        }
      } catch (error) {
        console.error("Error fetching scenario:", error);
        router.replace("/admin/scenarios");
      } finally {
        setLoading(false);
      }
    }

    fetchScenario();
  }, [params.id, router]);

  const handleAddMetric = () => {
    setSuccessMetrics([...successMetrics, {
      id: crypto.randomUUID(),
      name: "",
      weight: 1,
      criteria: [],
      description: "",
      keyPhrases: []
    }]);
  };

  const handleRemoveMetric = (id: string) => {
    setSuccessMetrics(successMetrics.filter(metric => metric.id !== id));
  };

  const handleMetricChange = (id: string, field: keyof typeof successMetrics[0], value: any) => {
    setSuccessMetrics(metrics => 
      metrics.map(metric => 
        metric.id === id ? { ...metric, [field]: value } : metric
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const scenarioRef = doc(db, "scenarios", params.id);
      await updateDoc(scenarioRef, {
        title,
        difficulty,
        description,
        customerBackground,
        situation,
        timeLimit,
        maxQuestions,
        successMetrics: successMetrics.filter(metric => metric.name && metric.description),
        isActive,
        updatedAt: Timestamp.now(),
      });

      router.push("/admin/scenarios");
    } catch (error) {
      console.error("Error updating scenario:", error);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/scenarios")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Scenarios
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-black">Edit Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2 border rounded-lg"
                placeholder="Enter scenario title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter scenario description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Background
              </label>
              <textarea
                value={customerBackground}
                onChange={(e) => setCustomerBackground(e.target.value)}
                required
                rows={3}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter customer background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Situation
              </label>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                required
                rows={3}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter the situation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  required
                  min={1}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Questions
                </label>
                <input
                  type="number"
                  value={maxQuestions}
                  onChange={(e) => setMaxQuestions(parseInt(e.target.value))}
                  required
                  min={1}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Success Metrics
                </label>
                <button
                  type="button"
                  onClick={handleAddMetric}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Metric
                </button>
              </div>
              <div className="space-y-2">
                {successMetrics.map((metric) => (
                  <div key={metric.id} className="border p-4 rounded-lg mb-4">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Success Metric</h4>
                      {successMetrics.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMetric(metric.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Name</label>
                        <input
                          type="text"
                          value={metric.name}
                          onChange={(e) => handleMetricChange(metric.id, 'name', e.target.value)}
                          className="w-full p-2 border rounded-lg"
                          placeholder="Enter metric name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Description</label>
                        <textarea
                          value={metric.description}
                          onChange={(e) => handleMetricChange(metric.id, 'description', e.target.value)}
                          className="w-full p-2 border rounded-lg"
                          rows={2}
                          placeholder="Enter metric description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Weight (1-5)</label>
                        <input
                          type="number"
                          value={metric.weight}
                          onChange={(e) => handleMetricChange(metric.id, 'weight', parseInt(e.target.value))}
                          min={1}
                          max={5}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Key Phrases (comma-separated)</label>
                        <input
                          type="text"
                          value={metric.keyPhrases?.join(', ')}
                          onChange={(e) => handleMetricChange(metric.id, 'keyPhrases', e.target.value.split(',').map(p => p.trim()))}
                          className="w-full p-2 border rounded-lg"
                          placeholder="Enter key phrases"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Success Criteria (comma-separated)</label>
                        <textarea
                          value={metric.criteria.join(', ')}
                          onChange={(e) => handleMetricChange(metric.id, 'criteria', e.target.value.split(',').map(c => c.trim()))}
                          className="w-full p-2 border rounded-lg"
                          rows={2}
                          placeholder="Enter success criteria"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active (visible to users)
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAdmin(EditScenarioPage);
