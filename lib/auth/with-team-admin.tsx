import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-context";
import { getTeamMembers } from "@/lib/services/teams";
import { TeamMember } from "@/types";

export function withTeamAdmin<P extends object>(
  WrappedComponent: React.ComponentType<P & { teamId: string }>
) {
  return function WithTeamAdminComponent(props: P & { teamId?: string }) {
    const { user, loading, currentTeamId } = useAuth();
    const router = useRouter();
    const [isTeamAdmin, setIsTeamAdmin] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);
    const effectiveTeamId = currentTeamId || props.teamId;

    if (!effectiveTeamId) return null;
    useEffect(() => {
      async function checkTeamRole() {
        if (user && effectiveTeamId) {
          try {
            const members = await getTeamMembers(effectiveTeamId);
            const userMember = members.find(m => m.userId === user.uid);
            setIsTeamAdmin(userMember?.role === "owner" || userMember?.role === "admin");
          } catch (error) {
            console.error("Error checking team role:", error);
          }
          setCheckingRole(false);
        }
      }

      // Update condition
      if (!loading) {
        if (!user) {
          router.replace("/login");
        } else if (effectiveTeamId) {
          checkTeamRole();
        }
      }
    }, [user, loading, currentTeamId, router]);

    if (loading || checkingRole) return null;
    if (!user || !isTeamAdmin) return null;

    return <WrappedComponent {...props} teamId={effectiveTeamId} />;
  };
}