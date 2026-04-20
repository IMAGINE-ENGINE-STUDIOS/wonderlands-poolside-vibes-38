import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface CategoryTabBarProps {
  categories: CategoryItem[];
  activeId: string;
  onChange: (id: string) => void;
}

const CategoryTabBar = ({ categories, activeId, onChange }: CategoryTabBarProps) => {
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll active pill into view on mobile
  React.useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const activeEl = scroller.querySelector<HTMLButtonElement>(`[data-id="${activeId}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeId]);

  return (
    <div className="sticky top-16 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div
          ref={scrollerRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3 md:justify-center"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = cat.id === activeId;
            return (
              <button
                key={cat.id}
                data-id={cat.id}
                onClick={() => onChange(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md hover:bg-primary/90"
                    : "bg-background text-foreground border-border hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabBar;
