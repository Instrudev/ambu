import { Button } from "./ui/button";

export const Topbar = () => {
  return (
    <header className="flex items-center justify-between bg-white border-b border-slate-200 px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Panel administrativo</h1>
        <p className="text-sm text-slate-500">Métricas y operaciones en tiempo real</p>
      </div>
      <Button variant="outline">Perfil admin</Button>
    </header>
  );
};
