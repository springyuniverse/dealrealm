"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, UserPlus, Users, X } from "lucide-react";
import { Team, Group, TeamMember } from "@/types";
import {
  getUserTeams,
  getTeamGroups,
  getTeamMembers,
  createGroup,
  addTeamMember,
  updateTeamMemberRole,
  updateTeamMemberGroups
} from "@/lib/services/teams";

export default function TeamManagePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");

  useEffect(() => {
    async function fetchTeams() {
      if (user) {
        try {
          const teamsData = await getUserTeams(user.uid);
          setTeams(teamsData);
          if (teamsData.length > 0) {
            setSelectedTeam(teamsData[0].id);
          }
        } catch (error) {
          console.error("Error fetching teams:", error);
        }
      }
    }
    fetchTeams();
  }, [user]);

  useEffect(() => {
    async function fetchTeamData() {
      if (selectedTeam) {
        try {
          const [groupsData, membersData] = await Promise.all([
            getTeamGroups(selectedTeam),
            getTeamMembers(selectedTeam)
          ]);
          setGroups(groupsData);
          setMembers(membersData);
        } catch (error) {
          console.error("Error fetching team data:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchTeamData();
  }, [selectedTeam]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !newGroupName.trim()) return;

    try {
      const group = await createGroup(selectedTeam, newGroupName, newGroupDescription);
      setGroups([...groups, group]);
      setNewGroupName("");
      setNewGroupDescription("");
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !newMemberEmail.trim()) return;

    try {
      const member = await addTeamMember(selectedTeam, newMemberEmail);
      setMembers([...members, member]);
      setNewMemberEmail("");
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleUpdateMemberRole = async (userId: string, newRole: "admin" | "member") => {
    if (!selectedTeam) return;

    try {
      await updateTeamMemberRole(selectedTeam, userId, newRole);
      setMembers(members.map(member => 
        member.userId === userId ? { ...member, role: newRole } : member
      ));
    } catch (error) {
      console.error("Error updating member role:", error);
    }
  };

  const handleUpdateMemberGroups = async (userId: string, groupId: string, add: boolean) => {
    if (!selectedTeam) return;

    try {
      const member = members.find(m => m.userId === userId);
      if (!member) return;

      const newGroupIds = add 
        ? [...member.groupIds, groupId]
        : member.groupIds.filter(id => id !== groupId);

      await updateTeamMemberGroups(selectedTeam, userId, newGroupIds);
      setMembers(members.map(m => 
        m.userId === userId ? { ...m, groupIds: newGroupIds } : m
      ));
    } catch (error) {
      console.error("Error updating member groups:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Team Management</h1>
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

      <div className="grid grid-cols-2 gap-6">
        {/* Groups Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGroup} className="mb-4">
              <div className="space-y-4">
                <Input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name"
                  className="bg-white text-black"
                />
                <Input
                  type="text"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Description"
                  className="bg-white text-black"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Group
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {groups.map(group => (
                <div key={group.id} className="p-3 border rounded-lg">
                  <div className="font-medium text-black">{group.name}</div>
                  <div className="text-sm text-gray-600">{group.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Members Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMember} className="mb-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Member email"
                  className="bg-white text-black"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {members.map(member => (
                <div key={member.userId} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-black">{member.userId}</div>
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateMemberRole(member.userId, e.target.value as "admin" | "member")}
                      className="px-2 py-1 border rounded text-sm"
                      disabled={member.role === "owner"}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      {member.role === "owner" && <option value="owner">Owner</option>}
                    </select>
                  </div>

                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-700 mb-1">Groups:</div>
                    <div className="flex flex-wrap gap-2">
                      {groups.map(group => (
                        <label key={group.id} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={member.groupIds.includes(group.id)}
                            onChange={(e) => handleUpdateMemberGroups(member.userId, group.id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          {group.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
