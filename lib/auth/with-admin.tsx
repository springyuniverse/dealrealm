import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/store/auth-context";

export function withAdmin<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAdminComponent(props: P) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.replace("/login");
        } else if (!isAdmin) {
          router.replace("/scenarios");
        }
      }
    }, [user, loading, isAdmin, router]);

    if (loading || !user || !isAdmin) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
