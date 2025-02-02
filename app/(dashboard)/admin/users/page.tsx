"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withAdmin } from "@/lib/auth/with-admin";
import { User, getUsers, updateUserRole } from "@/lib/services/users";
import { Shield, ShieldOff } from "lucide-react";

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleToggleRole = async (id: string, currentRole: "admin" | "user") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (window.confirm(`Are you sure you want to ${currentRole === "admin" ? "remove" : "grant"} admin rights for this user?`)) {
      try {
        await updateUserRole(id, newRole);
        setUsers(users.map(user => 
          user.id === id ? { ...user, role: newRole } : user
        ));
      } catch (error) {
        console.error("Error updating user role:", error);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Manage Users</h1>
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Company: {user.company}</p>
                  <p className="text-sm text-gray-500">
                    Joined: {user.createdAt.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Last active: {user.lastActive.toLocaleDateString()}
                  </p>
                </div>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default withAdmin(AdminUsersPage);
