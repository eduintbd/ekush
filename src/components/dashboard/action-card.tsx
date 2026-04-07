import Link from "next/link";
import { type LucideIcon } from "lucide-react";

interface ActionCardProps {
  href: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export function ActionCard({ href, label, icon: Icon, iconColor, iconBg }: ActionCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-[10px] shadow-card p-8 flex items-center gap-6 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity">
          <svg viewBox="0 0 80 80" fill="none">
            <path d="M80 0H0L80 80V0Z" fill={iconColor} />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity">
          <svg viewBox="0 0 64 64" fill="none">
            <path d="M64 64H0L64 0V64Z" fill={iconColor} />
          </svg>
        </div>

        <div
          className="w-[60px] h-[60px] rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-7 h-7" style={{ color: iconColor }} />
        </div>
        <span className="text-[16px] font-medium text-text-dark">{label}</span>
      </div>
    </Link>
  );
}
