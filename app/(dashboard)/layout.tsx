"use client";

import { useAuth } from "@/lib/store/auth-context";
import { UserNav } from "@/components/user-nav";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Prefetch all possible routes
  useEffect(() => {
    router.prefetch('/scenarios');
    if (isAdmin) {
      router.prefetch('/admin/scenarios');
      router.prefetch('/admin/users');
    }
  }, [router, isAdmin]);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-950">
        <div className="flex h-16 items-center px-4 max-w-6xl mx-auto">
          <Link href="/scenarios" className="flex items-center gap-2">
            <Image 
              src="/dealrealm-logo.svg" 
              alt="DealRealm Logo" 
              width={32} 
              height={32} 
            />
            <div>
              <div className="text-lg font-medium text-white">
                DealRealm
              </div>
              <div className="text-[10px] text-gray-400 leading-none">
                by NorthKraft
              </div>
            </div>
          </Link>
          <div className="ml-12">
            <nav className="flex items-center space-x-4 text-sm">
              <Link
                href="/scenarios"
                className={`text-gray-200 hover:text-white transition-colors ${
                  pathname === '/scenarios' ? 'text-white font-medium' : ''
                }`}
              >
                Scenarios
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/admin/scenarios"
                    className={`text-gray-200 hover:text-white transition-colors ${
                      pathname === '/admin/scenarios' ? 'text-white font-medium' : ''
                    }`}
                  >
                    Manage Scenarios
                  </Link>
                  <Link
                    href="/admin/users"
                    className={`text-gray-200 hover:text-white transition-colors ${
                      pathname === '/admin/users' ? 'text-white font-medium' : ''
                    }`}
                  >
                    Manage Users
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="ml-auto">
            <UserNav />
          </div>
        </div>
      </div>
      <main className="bg-white">{children}</main>
    </div>
  );
}
