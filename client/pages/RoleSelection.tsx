import { useApp } from "@/lib/context";
import { useNavigate } from "react-router-dom";
import { Shield, Settings, TrendingUp } from "lucide-react";
import { useEffect } from "react";

export default function RoleSelection() {
  const { t, theme } = useApp();
  const navigate = useNavigate();

  const roles = [
    {
      id: "auditor",
      icon: Shield,
      title: t("roleSelection.auditor.title"),
      label: t("roleSelection.auditor.label"),
      description: t("roleSelection.auditor.description"),
      color: "from-blue-500 to-cyan-500",
      borderColor: "border-blue-500",
    },
    {
      id: "administrator",
      icon: Settings,
      title: t("roleSelection.administrator.title"),
      label: t("roleSelection.administrator.label"),
      description: t("roleSelection.administrator.description"),
      color: "from-purple-500 to-pink-500",
      borderColor: "border-purple-500",
    },
    {
      id: "analyst",
      icon: TrendingUp,
      title: t("roleSelection.analyst.title"),
      label: t("roleSelection.analyst.label"),
      description: t("roleSelection.analyst.description"),
      color: "from-pink-500 to-purple-500",
      borderColor: "border-pink-500",
    },
  ];

  const handleRoleSelect = (roleId: string) => {
    // Store selected role temporarily (not setting it in context yet)
    localStorage.setItem("selectedRole", roleId);
    // Navigate to login
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950"
          : "bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100"
      }`}
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            {t("roleSelection.title")}
          </h1>
          <p
            className={`text-lg mb-2 ${
              theme === "dark" ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {t("roleSelection.subtitle")}
          </p>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {t("roleSelection.instruction")}
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50"
                    : "bg-white/80 border border-slate-200 hover:border-cyan-400"
                } rounded-xl p-8 backdrop-blur-sm hover:shadow-xl hover:shadow-cyan-500/10 text-left`}
              >
                {/* Gradient Border Effect */}
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-block p-3 rounded-lg bg-gradient-to-br ${role.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title and Label */}
                  <h2 className="text-xl font-bold mb-1">{role.title}</h2>
                  <p className="text-xs font-semibold text-afed-cyan mb-3">
                    {role.label}
                  </p>

                  {/* Description */}
                  <p
                    className={`text-sm mb-6 ${
                      theme === "dark"
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    {role.description}
                  </p>

                  {/* CTA Text */}
                  <div className="w-full py-2 px-4 rounded-lg bg-afed-cyan/20 text-afed-cyan font-medium transition-colors text-sm text-center">
                    {t("roleSelection.selectRole")}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}

      </div>
    </div>
  );
}
