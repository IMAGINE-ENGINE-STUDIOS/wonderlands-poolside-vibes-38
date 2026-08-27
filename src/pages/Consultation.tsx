import * as React from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Consultation — in-house scheduling page.
 *
 * Visitors never leave wonderlandsworld.com to book: the official Calendly
 * schedule (calendly.com/wonderlandsworlds/30min) is embedded here inside the
 * site's editorial frame, with the phone line as the direct alternative.
 * Presentation only.
 */

const CALENDLY_EMBED =
  "https://calendly.com/wonderlandsworlds/30min?hide_gdpr_banner=1&embed_domain=www.wonderlandsworld.com&embed_type=Inline";

const Consultation: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Book a Consultation | Wonderlands</title>
        <meta
          name="description"
          content="Schedule a 30-minute consultation with a Wonderlands specialist to design, price and plan your home transformation, pool, patio or solar project."
        />
        <link rel="canonical" href="https://www.wonderlandsworld.com/consultation" />
        <meta property="og:title" content="Book a Consultation | Wonderlands" />
        <meta
          property="og:description"
          content="Schedule a 30-minute consultation with a Wonderlands specialist."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />

      <main className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
          Wonderlands — Private Consultation
        </p>
        <h1 className="mt-6 max-w-3xl font-serif text-4xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl">
          Schedule your consultation
        </h1>
        <p className="mt-7 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Thirty minutes with a specialist: we review the property, the project you have
          in mind, and how the design, products and installation come together.
        </p>
        <div className="mt-9 h-px w-24 bg-foreground/30" />

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="overflow-hidden border border-border/70">
              <iframe
                src={CALENDLY_EMBED}
                title="Schedule a consultation with Wonderlands"
                loading="lazy"
                className="h-[900px] w-full border-0 md:h-[820px]"
              />
            </div>
          </div>

          <aside className="lg:col-span-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              Prefer to talk now
            </p>
            <a
              href="tel:+12392570637"
              className="mt-5 inline-flex font-serif text-3xl font-light text-foreground transition hover:opacity-70"
            >
              +1 (239) 257-0637
            </a>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Monday to Saturday. Tell us the address and what you would like to build —
              we will bring the drawings and the numbers to the call.
            </p>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Consultation;
