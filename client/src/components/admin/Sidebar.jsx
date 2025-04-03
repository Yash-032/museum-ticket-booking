import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  Image,
  Ticket,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { user, logoutMutation } = useAuth();

  const adminRoutes = [
    {
      name: t("admin.dashboard"),
      path: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: t("admin.users"),
      path: "/admin/users",
      icon: <Users className="h-5 w-5" />
    },
    {
      name: t("admin.exhibitions"),
      path: "/admin/exhibitions",
      icon: <Image className="h-5 w-5" />
    },
    {
      name: t("admin.tickets"),
      path: "/admin/tickets",
      icon: <Ticket className="h-5 w-5" />
    },
    {
      name: t("admin.analytics"),
      path: "/admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />
    }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="h-screen w-64 bg-neutral-900 text-white flex flex-col">
      <div className="p-6 border-b border-neutral-800">
        <Link href="/admin" className="flex items-center">
          <div className="font-bold text-xl flex items-center">
            <LayoutDashboard className="mr-2 h-6 w-6 text-primary-500" />
            MuseumTix</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {adminRoutes.map((route) => (
            <Link key={route.path} href={route.path}>
              <a
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                  location === route.path
                    ? "bg-primary-900/40 text-primary-500"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
              >
                <span className="mr-3">{route.icon}</span>
                {route.name}
              </a>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-neutral-800">
        <div className="mb-4 px-4 py-2">
          <p className="text-neutral-400 text-xs">Logged in as</p>
          <p className="text-sm font-medium">{user.fullName || user.username}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-800"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("auth.logout")}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
