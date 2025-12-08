interface SectionBannerProps {
  image: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

const SectionBanner = ({ image, alt, title, subtitle }: SectionBannerProps) => {
  return (
    <div className="relative w-full overflow-hidden">
      <img
        src={image}
        alt={alt}
        className="w-full h-auto object-cover"
        loading="lazy"
        decoding="async"
      />
      {(title || subtitle) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10">
          {title && (
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm md:text-lg text-white/90 max-w-2xl drop-shadow-md">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionBanner;
