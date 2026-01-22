type MetricCardProps = {
  titulo: string;
  valor: string;
  descripcion: string;
};

export const MetricCard = ({ titulo, valor, descripcion }: MetricCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <p className="text-sm text-slate-500 mb-2">{titulo}</p>
      <h3 className="text-3xl font-semibold text-slate-900 mb-1">{valor}</h3>
      <p className="text-xs text-slate-400">{descripcion}</p>
    </div>
  );
};
