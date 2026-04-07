export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-[10px] shadow-card" />
        ))}
      </div>
      <div className="h-64 bg-white rounded-[10px] shadow-card" />
    </div>
  );
}
