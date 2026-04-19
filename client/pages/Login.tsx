 import { useApp } from "@/lib/context";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Shield, Settings, TrendingUp, ArrowLeft } from "lucide-react";

export default function Login() {
  const { theme, setUserRole, t } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    // Get the role selected from previous page
    const role = localStorage.getItem("selectedRole");
    if (!role) {
      // If no role selected, go back to role selection
      navigate("/role-selection");
    } else {
      setSelectedRole(role);
    }
  }, [navigate]);

  const getRoleInfo = () => {
    const roles: Record<string, { icon: any; title: string; label: string; color: string }> = {
      auditor: {
        icon: Shield,
        title: t("roleSelection.auditor.title"),
        label: t("roleSelection.auditor.label"),
        color: "from-blue-500 to-cyan-500",
      },
      administrator: {
        icon: Settings,
        title: t("roleSelection.administrator.title"),
        label: t("roleSelection.administrator.label"),
        color: "from-purple-500 to-pink-500",
      },
      analyst: {
        icon: TrendingUp,
        title: t("roleSelection.analyst.title"),
        label: t("roleSelection.analyst.label"),
        color: "from-pink-500 to-purple-500",
      },
    };
    return roles[selectedRole] || roles.analyst;
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate login processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For now, accept any credentials (no backend auth yet)
    if (username && password) {
      // Set the role that was selected
      setUserRole(selectedRole as any);
      localStorage.setItem("userRole", selectedRole);
      localStorage.removeItem("selectedRole"); // Clean up temp storage
      navigate("/dashboard");
    } else {
      setError("Please enter username and password");
    }

    setIsLoading(false);
  };

  const handleGuestAccess = () => {
    setUserRole(selectedRole as any);
    localStorage.setItem("userRole", selectedRole);
    localStorage.removeItem("selectedRole");
    navigate("/dashboard");
  };

  const handleBackToRoles = () => {
    localStorage.removeItem("selectedRole");
    navigate("/role-selection");
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === "dark" ? "bg-slate-900" : "bg-slate-50"
    }`}>
      <div className={`w-full max-w-md p-8 rounded-2xl border ${
        theme === "dark" 
          ? "bg-slate-800 border-slate-700" 
          : "bg-white border-slate-200"
      }`}>
        {/* Back Button */}
        <button
          onClick={handleBackToRoles}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Role
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent mb-2">
            AFED
          </h1>
          <p className="text-sm text-muted-foreground">
            Automated Fraud & Event Detection
          </p>
        </div>

        {/* Selected Role Display */}
        <div className={`mb-6 p-4 rounded-lg border ${
          theme === "dark" ? "bg-slate-700/50 border-slate-600" : "bg-slate-50 border-slate-200"
        }`}>
          <p className="text-xs text-muted-foreground mb-2">Logging in as:</p>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${roleInfo.color}`}>
              <RoleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold">{roleInfo.title}</p>
              <p className="text-xs text-afed-cyan">{roleInfo.label}</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === "dark"
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-slate-300 text-slate-900"
              } focus:outline-none focus:ring-2 focus:ring-cyan-400`}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === "dark"
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-slate-300 text-slate-900"
              } focus:outline-none focus:ring-2 focus:ring-cyan-400`}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-cyan-400 to-pink-400 text-slate-900 font-bold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${
              theme === "dark" ? "bg-slate-800" : "bg-white"
            } text-muted-foreground`}>
              OR
            </span>
          </div>
        </div>

        {/* Guest Access */}
        <button
          onClick={handleGuestAccess}
          className={`w-full py-3 px-6 rounded-lg border-2 font-medium transition-colors ${
            theme === "dark"
              ? "border-slate-600 hover:bg-slate-700"
              : "border-slate-300 hover:bg-slate-50"
          }`}
        >
          Continue as Guest
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
