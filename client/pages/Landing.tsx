import { useApp } from "@/lib/context";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Settings, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const { t, theme } = useApp();
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleStart = () => {
    navigate("/role-selection");
  };

  const handleRoleSelect = (roleId: string) => {
    localStorage.setItem("userRole", roleId);
    setShowRoleModal(false);
    navigate("/dashboard");
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden ${
        theme === "dark"
          ? "bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900"
          : "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100"
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-40 left-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-60 h-60 bg-pink-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        {/* Logo/Title */}
        <div className="mb-12">
          <div className="text-7xl md:text-8xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
            AFED
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-4">
            {t("landing.subtitle")}
          </p>
          <p
            className={`text-lg ${
              theme === "dark"
                ? "text-slate-300"
                : "text-slate-600"
            }`}
          >
            {t("landing.description")}
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleStart}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 text-slate-900 font-bold text-lg hover:shadow-2xl hover:shadow-cyan-400/50 transition-all duration-300 hover:gap-3 group"
        >
          {t("landing.start")}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Footer */}

      </div>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div
            className={`w-full max-w-4xl rounded-2xl p-12 ${
              theme === "dark"
                ? "bg-slate-900/95 backdrop-blur-sm"
                : "bg-white/95 backdrop-blur-sm"
            }`}
          >
            {/* Header */}
            <div className="text-center mb-12">
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
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  id: "auditor",
                  icon: Shield,
                  title: t("roleSelection.auditor.title"),
                  label: t("roleSelection.auditor.label"),
                  description: t("roleSelection.auditor.description"),
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  id: "administrator",
                  icon: Settings,
                  title: t("roleSelection.administrator.title"),
                  label: t("roleSelection.administrator.label"),
                  description: t("roleSelection.administrator.description"),
                  color: "from-purple-500 to-pink-500",
                },
                {
                  id: "analyst",
                  icon: TrendingUp,
                  title: t("roleSelection.analyst.title"),
                  label: t("roleSelection.analyst.label"),
                  description: t("roleSelection.analyst.description"),
                  color: "from-pink-500 to-purple-500",
                },
              ].map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`relative group cursor-pointer transition-all duration-300 ${
                      theme === "dark"
                        ? "bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50"
                        : "bg-slate-50 border border-slate-200 hover:border-cyan-400"
                    } rounded-xl p-8 hover:shadow-xl hover:shadow-cyan-500/10 text-left`}
                  >
                    {/* Gradient Border Effect */}
                    <div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div
                        className={`inline-block p-3 rounded-lg bg-gradient-to-br ${role.color} mb-4`}
                      >
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
          </div>
        </div>
      )}
    </div>
  );
}
