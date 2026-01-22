import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { MetricCard } from "../components/MetricCard";
import { DriversTable } from "../components/DriversTable";
import { apiFetch } from "../api/client";

const mockDrivers = [
  { nombre: "Ana Castillo", email: "ana@ambu.com", estado: "Disponible", institucion: "Salud Norte" },
  { nombre: "Luis Prado", email: "luis@ambu.com", estado: "En servicio", institucion: "Centro Vital" },
  { nombre: "María Rojas", email: "maria@ambu.com", estado: "Soporte", institucion: "Salud Norte" }
];

export const App = () => {
  const { data } = useQuery({
    queryKey: ["metricas"],
    queryFn: async () => {
      return apiFetch<{ instituciones: unknown[] }>("/admin/institutions");
    }
  });

  const totalInstituciones = data?.instituciones.length ?? 0;

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              titulo="Incidentes activos"
              valor="12"
              descripcion="Actualización en tiempo real"
            />
            <MetricCard
              titulo="Conductores en servicio"
              valor="8"
              descripcion="Turnos activos en ruta"
            />
            <MetricCard
              titulo="Instituciones"
              valor={`${totalInstituciones}`}
              descripcion="Registradas en el sistema"
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Conductores en turno</h2>
            <DriversTable data={mockDrivers} />
          </section>
        </main>
      </div>
    </div>
  );
};
