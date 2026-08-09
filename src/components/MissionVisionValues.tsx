import lifesaverTeal from "@/assets/lifesaver-teal.webp";
import lifesaverCoral from "@/assets/lifesaver-coral.webp";
import lifesaverYellow from "@/assets/lifesaver-yellow.webp";

const ITEMS = [
  {
    image: lifesaverTeal,
    title: "Our Mission",
    text: "To transform backyards into unforgettable wonderlands where families create lifelong memories, one pool at a time.",
  },
  {
    image: lifesaverCoral,
    title: "Our Vision",
    text: "To be Florida's most loved pool builder — redefining outdoor living with bold design, craftsmanship and joy.",
  },
  {
    image: lifesaverYellow,
    title: "Our Values",
    text: "Quality without compromise, transparent pricing, and a playful spirit in everything we build for our clients.",
  },
];

const MissionVisionValues = () => {
  return (
    <section
      aria-label="Mission, Vision and Values"
      className="relative py-20 px-4 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-orange">
            What Drives Wonderlands
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Bold ideas, playful design, and craftsmanship you can dive into.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className="group relative flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl scale-110 opacity-70 group-hover:opacity-100 transition-opacity" />
                <img
                  src={item.image}
                  alt={item.title}
                  width={220}
                  height={220}
                  loading="lazy"
                  decoding="async"
                  className="relative w-44 h-44 md:w-52 md:h-52 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-6"
                />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">
                {item.title}
              </h3>
              <p className="text-foreground/70 max-w-xs leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionVisionValues;
