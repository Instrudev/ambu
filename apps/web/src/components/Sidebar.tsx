import { Button } from "./ui/button";

const items = [
  { label: "Dashboard" },
  { label: "Instituciones" },
  { label: "Ambulancias" },
  { label: "Conductores" },
  { label: "Incidentes" }
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden lg:block">
      <h2 className="text-xl font-bold text-slate-900 mb-8">Ambu Admin</h2>
      <nav className="space-y-2">
        {items.map((item) => (
          <Button key={item.label} variant="outline" className="w-full justify-start">
            {item.label}
          </Button>
        ))}
      </nav>
    </aside>
  );
};
