import { useApp } from "@/lib/context";
import { Moon, Sun, Globe, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export const Layout = ({ children, showNav = true }: LayoutProps) => {
  const { t, theme, setTheme, language, setLanguage, userRole, setUserRole } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const allNavItems = [
    { path: "/dashboard", label: t("nav.dashboard"), roles: ["auditor", "administrator", "analyst", "guest"] },
    { path: "/detection", label: t("nav.detection"), roles: ["auditor", "administrator", "analyst", "guest"] },
    { path: "/reports", label: t("nav.reports"), roles: ["auditor", "administrator", "analyst", "guest"] },
    { path: "/settings", label: t("nav.settings"), roles: ["administrator", "auditor", "analyst", "guest"] },
  ];

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item => {
    if (!userRole) return true;
    return item.roles.includes(userRole);
  });

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem("userRole");
    localStorage.removeItem("selectedRole");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-afed-cyan">
              AFED
            </Link>

            {showNav && (
              <nav className="hidden md:flex items-center gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? "text-afed-cyan border-b-2 border-afed-cyan pb-1"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Role Indicator */}
              {userRole && userRole !== "guest" && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-afed-cyan/10 border border-afed-cyan/30">
                  <span className="text-xs font-medium text-afed-cyan capitalize">
                    {userRole}
                  </span>
                </div>
              )}

              {/* Logout Button */}
              {userRole && (
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title={theme === "dark" ? "Light Mode" : "Dark Mode"}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-afed-cyan" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium flex items-center gap-2"
                title={language === "en" ? "Switch to Hindi" : "Switch to English"}
              >
                <Globe className="w-4 h-4" />
                {language.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
