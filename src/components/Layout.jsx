import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/new-log", label: "New Log" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" }
];

export default function Layout({ children }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-900">Placement Daily Log</h1>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-3xl grid-cols-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-2 py-3 text-center text-sm ${
                  isActive ? "font-semibold text-blue-700" : "text-slate-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
