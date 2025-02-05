"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withAdmin } from "@/lib/auth/with-admin";
import { getUsers, updateUser } from "@/lib/services/users";
import { getUserTeams, createTeam, addTeamMember } from "@/lib/services/teams";
import { User, Team, TeamMember } from "@/types";
import { Shield, ShieldOff, Users, Plus } from "lucide-react";

interface ExtendedUser extends User {
  teamRole?: TeamMember['role'];
  groupIds?: string[];
}

function AdminUsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersData, teamsData] = await Promise.all([
          getUsers(selectedTeam),
          getUserTeams(selectedTeam)
        ]);
        setUsers(usersData);
        setTeams(teamsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedTeam]);

  const handleToggleRole = async (id: string, currentRole: "admin" | "user") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (window.confirm(`Are you sure you want to ${currentRole === "admin" ? "remove" : "grant"} admin rights for this user?`)) {
      try {
        await updateUser(id, { role: newRole });
        setUsers(users.map(user => 
          user.id === id ? { ...user, role: newRole } : user
        ));
      } catch (error) {
        console.error("Error updating user role:", error);
      }
    }
  };

  const handleCreateTeam = async () => {
    const teamName = window.prompt("Enter team name:");
    if (teamName) {
      try {
        const currentUser = users.find(u => u.role === "admin"); // Get first admin as owner
        if (!currentUser) throw new Error("No admin user found");
        
        const newTeam = await createTeam(teamName, currentUser.id);
        setTeams([...teams, newTeam]);
      } catch (error) {
        console.error("Error creating team:", error);
      }
    }
  };

  const handleAddToTeam = async (userId: string) => {
    const teamId = window.prompt("Enter team ID to add user to:");
    if (teamId) {
      try {
        await addTeamMember(teamId, userId);
        // Refresh users list
        const updatedUsers = await getUsers(selectedTeam);
        setUsers(updatedUsers);
      } catch (error) {
        console.error("Error adding user to team:", error);
      }
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
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Manage Users</h1>
        <div className="flex gap-4">
          <select 
            value={selectedTeam} 
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Users</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
          <button
            onClick={handleCreateTeam}
            className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl text-black">{user.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {user.role}
                  </span>
                  {user.teamRole && (
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                      {user.teamRole}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Joined: {user.createdAt.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Last active: {user.lastActive.toLocaleDateString()}
                  </p>
                  {user.groupIds && user.groupIds.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Groups: {user.groupIds.length}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToTeam(user.id)}
                    className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Add to Team
                  </button>
                  <button
                    onClick={() => handleToggleRole(user.id, user.role)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      user.role === "admin"
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <>
                        <ShieldOff className="w-4 h-4" />
                        Remove Admin
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Make Admin
                      </>
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default withAdmin(AdminUsersPage);
