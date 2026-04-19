import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useApp } from "@/lib/context";
import { Home } from "lucide-react";

const NotFound = () => {
  const { theme } = useApp();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950"
          : "bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100"
      }`}
    >
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-2xl font-bold mb-2">Page Not Found</p>
        <p
          className={`mb-8 ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          }`}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-afed-cyan text-slate-900 font-bold hover:opacity-90 transition-opacity"
        >
          <Home className="w-5 h-5" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
