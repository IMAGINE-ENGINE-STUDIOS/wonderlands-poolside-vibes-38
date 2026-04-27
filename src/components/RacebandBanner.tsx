interface RacebandBannerProps {
  title: string;
  subtitle?: string;
  variant?: "primary" | "coral" | "teal";
}

const variantMap = {
  primary: "from-primary via-teal to-primary",
  coral: "from-coral via-orange to-coral",
  teal: "from-teal via-primary to-teal",
};

const RacebandBanner = ({ title, subtitle, variant = "primary" }: RacebandBannerProps) => {
  return (
    <div className="w-full my-8 px-4">
      <div
        className={`relative w-full h-12 md:h-14 rounded-full overflow-hidden shadow-lg bg-gradient-to-r ${variantMap[variant]} flex items-center px-6 md:px-10`}
      >
        {/* Glossy latex highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent" />

        <div className="relative flex items-center gap-3 md:gap-5 w-full">
          <h3 className="text-sm md:text-base font-bold text-white tracking-wide uppercase whitespace-nowrap drop-shadow-sm">
            {title}
          </h3>
          {subtitle && (
            <>
              <span className="hidden md:inline-block w-px h-5 bg-white/50" />
              <p className="hidden md:block text-xs md:text-sm text-white/90 truncate">
                {subtitle}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RacebandBanner;
