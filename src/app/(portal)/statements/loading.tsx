export default function StatementsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-white rounded-[10px] shadow-card" />
        <div className="h-72 bg-white rounded-[10px] shadow-card" />
      </div>
      <div className="h-48 bg-white rounded-[10px] shadow-card" />
      <div className="h-48 bg-white rounded-[10px] shadow-card" />
    </div>
  );
}
