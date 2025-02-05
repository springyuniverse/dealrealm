"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/store/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Users, FileText } from "lucide-react";
import { getUserTeamMemberships } from "@/lib/services/teams";
import { TeamMember } from "@/types";

export function UserNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [teamRoles, setTeamRoles] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamRoles() {
      if (user) {
        try {
          const memberships = await getUserTeamMemberships(user.uid);
          setTeamRoles(memberships);
        } catch (error) {
          console.error("Error fetching team roles:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchTeamRoles();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) return null;

  const isTeamOwnerOrAdmin = teamRoles.some(member => 
    member.role === "owner" || member.role === "admin"
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-sm font-medium text-white hover:bg-blue-900">
          {user.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isTeamOwnerOrAdmin && (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push('/team/manage')}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Team Management</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push('/admin/scenarios')}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Manage Scenarios</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          className="text-red-600 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
