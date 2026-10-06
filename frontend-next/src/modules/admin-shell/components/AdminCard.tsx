export default function AdminCard({
  children,
  className = "",
  padding = "20px 22px",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <div className={className} style={{ background: "#fff", borderRadius: 20, padding }}>
      {children}
    </div>
  );
}
