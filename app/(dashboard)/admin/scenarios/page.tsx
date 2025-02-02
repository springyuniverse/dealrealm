"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withAdmin } from "@/lib/auth/with-admin";
import { Scenario, getAllScenarios, deleteScenario, toggleScenarioStatus } from "@/lib/services/scenarios";
import { Plus, Edit, Trash2, Eye, Power } from "lucide-react";

function AdminScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchScenarios() {
      try {
        const data = await getAllScenarios();
        setScenarios(data);
      } catch (error) {
        console.error("Error fetching scenarios:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchScenarios();
  }, []);

  const handleCreateScenario = () => {
    router.push("/admin/scenarios/create");
  };

  const handleEditScenario = (id: string) => {
    router.push(`/admin/scenarios/${id}/edit`);
  };

  const handlePreviewScenario = (id: string) => {
    router.push(`/scenarios/${id}/session`);
  };

  const handleDeleteScenario = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this scenario?")) {
      try {
        await deleteScenario(id);
        setScenarios(scenarios.filter(s => s.id !== id));
      } catch (error) {
        console.error("Error deleting scenario:", error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleScenarioStatus(id, !currentStatus);
      setScenarios(scenarios.map(s => 
        s.id === id ? { ...s, isActive: !currentStatus } : s
      ));
    } catch (error) {
      console.error("Error toggling scenario status:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Manage Scenarios</h1>
        <button
          onClick={handleCreateScenario}
          className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Scenario
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {scenarios.map((scenario) => (
          <Card key={scenario.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl text-black">{scenario.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Created {scenario.createdAt.toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    scenario.isActive 
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {scenario.isActive ? "Active" : "Draft"}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {scenario.difficulty}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-black mb-4">{scenario.description}</p>
              <div className="mb-4">
                <h4 className="font-medium mb-2 text-black">Success Metrics:</h4>
                <ul className="space-y-1">
                  {scenario.successMetrics.map((metric) => (
                    <li key={metric.id} className="text-sm text-gray-600">
                      • {metric.description}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleToggleStatus(scenario.id, scenario.isActive)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    scenario.isActive
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  <Power className="w-4 h-4" />
                  {scenario.isActive ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => handlePreviewScenario(scenario.id)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => handleEditScenario(scenario.id)}
                  className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteScenario(scenario.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default withAdmin(AdminScenariosPage);
