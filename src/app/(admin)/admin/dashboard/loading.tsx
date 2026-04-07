export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-white rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-[10px] shadow-card" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-white rounded-[10px] shadow-card" />
        ))}
      </div>
      <div className="h-48 bg-white rounded-[10px] shadow-card" />
    </div>
  );
}
