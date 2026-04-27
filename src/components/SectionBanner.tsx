interface SectionBannerProps {
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
  id?: string;
}

const SectionBanner = ({ image, alt, title, subtitle, id }: SectionBannerProps) => {
  return (
    <div id={id} className="relative w-full overflow-hidden h-16 md:h-20">
      <img
        src={image}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      {(title || subtitle) && (
        <div className="absolute inset-0 bg-black/50 flex items-center px-4 md:px-8 gap-4">
          {title && (
            <h2 className="text-base md:text-lg font-semibold text-white tracking-wide">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="hidden md:block text-xs md:text-sm text-white/80 truncate">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionBanner;
