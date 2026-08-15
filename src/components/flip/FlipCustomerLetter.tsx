import React from "react";
import wonderlandsLogo from "@/assets/wonderlands-logo.webp";

/**
 * The one pager — Wonderlands World's written commitment to the customer.
 * Printed as a single leaf inside every product dossier and category edition.
 */
export const FlipCustomerLetter: React.FC<{ categoryLabel?: string; modelName?: string }> = ({
  categoryLabel,
  modelName,
}) => (
  <div className="flex h-full w-full flex-col overflow-hidden p-7 sm:p-9">
    <div className="flex items-start justify-between gap-4">
      <img
        src={wonderlandsLogo}
        alt="Wonderlands World"
        loading="lazy"
        decoding="async"
        className="h-10 w-auto object-contain sm:h-12"
      />
      <p className="text-right text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
        A letter to our client
        {categoryLabel ? <><br />{categoryLabel}</> : null}
      </p>
    </div>

    <h3 className="mt-5 font-serif text-2xl font-light leading-tight sm:text-3xl">
      One company, one contract, one standard of work.
    </h3>

    <div className="mt-4 min-h-0 flex-1 overflow-hidden">
      <p className="font-serif text-[12.5px] leading-relaxed text-foreground/90 first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-[0.8]">
        Buying an outdoor project should not require you to manage six trades and hope they agree with one another.
        Wonderlands World surveys your property, engineers the design to Florida code, pulls the permits, and installs
        the work with our own crews. The drawing you approve is the drawing we build{modelName ? `, ${modelName} included` : ""}.
      </p>

      <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
        Our prices are written the way they should be read: the product as described, delivered and installed. Every pool
        we set includes its salt water system, Pentair equipment package and LED lighting as standard — not as an
        upcharge discovered later. Additional features are quoted at the same rates you see in Wonderlands Studio, per
        square foot or per unit, so the estimate in your hands is the estimate on the contract.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-border/50 pt-4">
        {[
          ["Surveyed", "Measured on site, drawn to your property lines and setbacks."],
          ["Engineered", "Structural, electrical and enclosure work permitted to Florida standards."],
          ["Installed", "Set, plumbed, tested and started up by the crew that quoted it."],
          ["Warrantied", "Registered on completion, with one number to call afterwards."],
        ].map(([title, body]) => (
          <div key={title}>
            <p className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">{title}</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-foreground/80">{body}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-4 border-t border-border/50 pt-3">
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        When you are ready, book a survey at{" "}
        <span className="text-foreground">calendly.com/wonderlandsworlds/30min</span> — or add what you like in this
        edition to your estimate and we will price the whole composition as one project.
      </p>
      <p className="mt-2 font-serif text-[11px] text-foreground">
        Wonderlands World — Residential outdoor living, built in-house.
      </p>
    </div>
  </div>
);

export default FlipCustomerLetter;
