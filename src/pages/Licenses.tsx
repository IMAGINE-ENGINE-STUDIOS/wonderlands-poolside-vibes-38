import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, FileText, Ban, Scale } from "lucide-react";

import madrePerlaImage from "@/assets/pools/wonderlands/madre-perla.webp";
import maximaImage from "@/assets/pools/wonderlands/maxima-pool.webp";
import pacificRidgeImage from "@/assets/pools/wonderlands/pacific-ridge-new.webp";
import wonderPalaceImage from "@/assets/pools/wonderlands/wonderpalace.webp";

/**
 * Licenses — public register of Wonderlands' proprietary pool models and
 * software, presented as products: photo, catalog price, license price, terms.
 *
 * Ownership dates from the company's inception: Wonderlands World Experience
 * LLC was filed in Florida on August 21, 2025 (Sunbiz Doc. L25000387663),
 * effective August 25, 2025. The license documents themselves were issued
 * November 15, 2026 — the page states both, exactly as the license files do.
 * Terms mirror ~/workspace/your_files/wonderlands-pool-model-licenses/.
 */

const PROPRIETARY_SINCE =
  "Proprietary since August 25, 2025 — the inception of Wonderlands World Experience LLC (filed in Florida on August 21, 2025, Sunbiz Doc. L25000387663, effective August 25, 2025).";

interface PoolModelLicense {
  name: string;
  type: string;
  dimensions: string;
  depth: string;
  catalogPrice: string;
  image: string;
  imageAlt: string;
  extraNote?: string;
}

const POOL_MODELS: PoolModelLicense[] = [
  {
    name: "Madre Perla",
    type: "Premium concrete pool with infinity edge and integrated spa",
    dimensions: "20' x 40'",
    depth: "3'11\" to 9'",
    catalogPrice: "$168,438",
    image: madrePerlaImage,
    imageAlt: "Madre Perla — proprietary Wonderlands pool model",
  },
  {
    name: "Maxima",
    type: "Premium pool of the Wonderlands World Collection",
    dimensions: "16' x 40'",
    depth: "3'9\" to 8'6\"",
    catalogPrice: "$144,375",
    image: maximaImage,
    imageAlt: "Maxima — proprietary Wonderlands pool model",
  },
  {
    name: "Pacific Ridge",
    type: "Concrete pool, rectangular design",
    dimensions: "14' x 32'",
    depth: "3'6\" to 6'",
    catalogPrice: "$96,250",
    image: pacificRidgeImage,
    imageAlt: "Pacific Ridge — proprietary Wonderlands pool model",
  },
  {
    name: "Winderview",
    type: "Concrete pool with integrated tanning ledge",
    dimensions: "15.5' x 31'",
    depth: "3'6\" to 6'",
    catalogPrice: "$91,875",
    image: "/media/winderview-pool.webp",
    imageAlt: "Winderview — proprietary Wonderlands pool model",
    extraNote:
      "The original photo of this model carries the Wonderlands logo integrated into the image. Cropping it out is an additional violation (17 U.S.C. § 1202).",
  },
  {
    name: "Cape Coral",
    type: "Concrete pool with integrated spa and spillover",
    dimensions: "14' x 28'",
    depth: "6'",
    catalogPrice: "$85,000",
    image: wonderPalaceImage,
    imageAlt: "Cape Coral — proprietary Wonderlands pool model",
  },
];

const MODEL_PROHIBITED = (name: string) => [
  `Publishing the photos of the ${name} model on another website, social network, advertisement or listing.`,
  `Using the name "${name}" to sell pools of another company.`,
  "Cropping, editing or removing the Wonderlands logo or brand from the images.",
  "Presenting the model or its projects as your own work.",
];

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">{children}</p>
);

const ModelCard = ({ model }: { model: PoolModelLicense }) => (
  <Card className="flex h-full flex-col overflow-hidden">
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
      <img
        src={model.image}
        alt={model.imageAlt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <Badge className="absolute left-3 top-3 bg-background/90 text-foreground hover:bg-background/90">
        Proprietary Model
      </Badge>
    </div>
    <CardHeader className="pb-2">
      <CardTitle className="font-serif text-2xl tracking-tight">{model.name}</CardTitle>
      <p className="text-sm text-muted-foreground">{model.type}</p>
      <p className="text-sm text-muted-foreground">
        {model.dimensions} · Depth {model.depth}
      </p>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col gap-4">
      <div className="flex items-baseline justify-between border-y border-border py-3">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Catalog price (installed)
        </span>
        <span className="font-serif text-xl">{model.catalogPrice}</span>
      </div>

      <div className="bg-muted/40 p-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Usage License</p>
        <p className="mt-2 font-serif text-2xl leading-snug">
          $10,000 <span className="text-base text-muted-foreground">/ year per model</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          + 5% royalty on each pool sold under this model
        </p>
      </div>

      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Ownership.</strong> The {model.name} model — its name,
          design, photographs, description and catalog presentation — is the exclusive property of
          Wonderlands World Experience LLC. {PROPRIETARY_SINCE} No use transfers any ownership.
        </p>
        <p>
          <strong className="text-foreground">How a license is obtained.</strong> Only with a
          license document <strong className="text-foreground">signed by Wonderlands World
          Experience LLC</strong> and payment completed before use. Without that document there is
          no license, verbal or implied. The annual fee is paid in advance; the royalty is reported
          and paid quarterly, with the detail of each sale.
        </p>
        <div>
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Ban className="h-4 w-4" /> Prohibited without a license
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {MODEL_PROHIBITED(model.name).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        {model.extraNote && <p>{model.extraNote}</p>}
        <p>
          <strong className="text-foreground">Unauthorized use.</strong> Any use without a signed
          license is an infringement. The infringer is liable for the license fee for the entire
          period of use, plus the 5% royalty on sales made with the model, plus the damages and
          remedies provided by U.S. copyright law (17 U.S.C.), and must remove the material
          immediately when Wonderlands demands it.
        </p>
      </div>
    </CardContent>
  </Card>
);

const BERMUDA_PROHIBITED = [
  "Publishing this image on any website, social network, advertisement or listing.",
  "Using this image to sell pools of another company as if the image were your own work.",
  "Cropping, altering or removing any Wonderlands mark or logo from the image (17 U.S.C. § 1202).",
  "Presenting the image or the projects shown in it as your own work.",
];

const BermudaImageCard = () => (
  <Card className="flex h-full flex-col overflow-hidden">
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
      <img
        src="/media/bermuda-pool.webp"
        alt="Bermuda — proprietary Wonderlands image"
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <Badge className="absolute left-3 top-3 bg-background/90 text-foreground hover:bg-background/90">
        Proprietary Image License
      </Badge>
    </div>
    <CardHeader className="pb-2">
      <CardTitle className="font-serif text-2xl tracking-tight">Bermuda</CardTitle>
      <p className="text-sm text-muted-foreground">
        Manufacturer shell by Latham — Wonderlands proprietary image &amp; catalog presentation
      </p>
      <p className="text-sm text-muted-foreground">
        Bermuda 12 · 12' x 24' — the same Wonderlands image is used in the Wonderlands catalog for
        Bermuda 12, Bermuda 12 Deluxe, Bermuda 14 and Bermuda 14 Deluxe
      </p>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col gap-4">
      <div className="border-y border-border py-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Catalog price — Bermuda 12
          </span>
          <span className="font-serif text-xl">$56,525</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Catalog price — Bermuda 12 Deluxe
          </span>
          <span className="font-serif text-xl">$70,000</span>
        </div>
      </div>

      <div className="bg-muted/40 p-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Usage License</p>
        <p className="mt-2 font-serif text-2xl leading-snug">
          $10,000 <span className="text-base text-muted-foreground">/ year for this image</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          + 5% royalty on each pool sold using this image
        </p>
      </div>

      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Ownership.</strong> "Bermuda" is a model name of the
          manufacturer Latham; Wonderlands does not claim that name. What is the exclusive property
          of Wonderlands World Experience LLC is the{" "}
          <strong className="text-foreground">image</strong> — the proprietary photograph/render
          published at wonderlandsworld.com/media/bermuda-pool.webp — together with its catalog
          presentation. {PROPRIETARY_SINCE} No use transfers any ownership.
        </p>
        <p>
          <strong className="text-foreground">How a license is obtained.</strong> Only with a
          license document <strong className="text-foreground">signed by Wonderlands World
          Experience LLC</strong> and payment completed before use. Without that document there is
          no license, verbal or implied. The annual fee is paid in advance; the royalty is reported
          and paid quarterly, with the detail of each sale.
        </p>
        <div>
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Ban className="h-4 w-4" /> Prohibited without a license
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {BERMUDA_PROHIBITED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <p>
          <strong className="text-foreground">Unauthorized use.</strong> Any use without a signed
          license is an infringement. The infringer is liable for the license fee for the entire
          period of use, plus the 5% royalty on sales made with the image, plus the damages and
          remedies provided by U.S. copyright law (17 U.S.C. §§ 502–505), and must remove the
          material immediately when Wonderlands demands it.
        </p>
      </div>
    </CardContent>
  </Card>
);

const NATURAL_POOL_PROHIBITED = [
  "Offering, marketing or selling the Natural Pool product, design or concept as your own.",
  "Publishing its photographs or its catalog presentation on any website, social network, advertisement or listing.",
  "Building a pool to the Natural Pool design — freeform concrete sanctuary with integrated rock waterfall and water features — under the Natural Pool name or presentation.",
  "Presenting the Natural Pool or the projects shown in its photographs as your own work.",
];

const NaturalPoolCard = () => (
  <Card className="flex h-full flex-col overflow-hidden">
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
      <img
        src="https://bwngxlbnavnhbtahyzbf.supabase.co/storage/v1/object/public/site-assets/l5e/e0ff3e40-ac8a-4ee6-9afe-43f9c2d40a96__natural-pool-view-1.jpg"
        alt="Natural Pool — proprietary Wonderlands product"
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <Badge className="absolute left-3 top-3 bg-background/90 text-foreground hover:bg-background/90">
        Proprietary Product License
      </Badge>
    </div>
    <CardHeader className="pb-2">
      <CardTitle className="font-serif text-2xl tracking-tight">Natural Pool</CardTitle>
      <p className="text-sm text-muted-foreground">
        Wonderlands World Collection — bespoke freeform concrete pool, designed to order
      </p>
      <p className="text-sm text-muted-foreground">
        Custom dimensions · Freeform design · Integrated water features, including rock waterfall
      </p>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col gap-4">
      <div className="flex items-baseline justify-between border-y border-border py-3">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Catalog price
        </span>
        <span className="font-serif text-xl">Consultation only</span>
      </div>

      <div className="bg-muted/40 p-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Usage License</p>
        <p className="mt-2 font-serif text-2xl leading-snug">
          $10,000 <span className="text-base text-muted-foreground">/ year for this product</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          + 5% royalty on each Natural Pool project sold
        </p>
      </div>

      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">Ownership.</strong> The Natural Pool product — its
          name, its bespoke freeform design, its photographs and its catalog presentation — is the
          exclusive property of Wonderlands World Experience LLC. {PROPRIETARY_SINCE} No use
          transfers any ownership.
        </p>
        <p>
          <strong className="text-foreground">How a license is obtained.</strong> Only with a
          license document <strong className="text-foreground">signed by Wonderlands World
          Experience LLC</strong> and payment completed before use. Without that document there is
          no license, verbal or implied. The annual fee is paid in advance; the royalty is reported
          and paid quarterly, with the detail of each project sold.
        </p>
        <div>
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Ban className="h-4 w-4" /> Prohibited without a license
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {NATURAL_POOL_PROHIBITED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <p>
          <strong className="text-foreground">Unauthorized use.</strong> Any use without a signed
          license is an infringement. The infringer is liable for the license fee for the entire
          period of use, plus the 5% royalty on projects sold with the product, plus the damages
          and remedies provided by U.S. copyright law (17 U.S.C. §§ 502–505), and must remove the
          material immediately when Wonderlands demands it.
        </p>
      </div>
    </CardContent>
  </Card>
);

const SOFTWARE_TIERS = [
  { name: "Full Suite — every tool included", price: "$1,500 / month" },
  {
    name: "Design Studio, Design Boards, Quote Atelier, Wonderlands Studio, Suites, Blueprint Builder and Solar Genius, bought separately",
    price: "from $499 / month each",
  },
  {
    name: "FLIP Catalogue, Live Video, Company CRM, Socialite and Pool Calculator, bought separately",
    price: "$50–$150 / month each",
  },
  {
    name: "Genius, bought separately",
    price:
      "$50 / month plus credits — 1 Credit = $0.06, at no more than twice the provider cost; failed runs are never charged.",
  },
];

const Licenses = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Licenses — Wonderlands World Experience LLC</title>
        <meta
          name="description"
          content="Official license register of Wonderlands World Experience LLC: proprietary pool models and the Wonderlands website platform & software. Use requires a signed license."
        />
      </Helmet>

      <Header />

      <main>
        {/* Header */}
        <section className="mx-auto max-w-[1600px] px-6 pb-8 pt-20 md:px-12 md:pt-28">
          <Eyebrow>Wonderlands World Experience LLC</Eyebrow>
          <h1 className="mt-6 font-serif text-4xl leading-tight tracking-tight md:text-6xl">
            Licenses
          </h1>
          <p className="mt-8 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Every model, image, and software product below is proprietary property of Wonderlands
            World Experience LLC. Use requires a signed license.{" "}
            <strong className="text-foreground">No signed license = no permission.</strong>
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {PROPRIETARY_SINCE} These models, their names, their images and the software are
            property of Wonderlands from their creation under the company.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Licensing contact: sales@wonderlandsworld.com
            </span>
            <span>239-257-0637</span>
            <span>6900 Tavistock Lakes Blvd, Suite 400, Orlando, FL 32827</span>
          </div>
        </section>

        <div className="mx-auto max-w-[1600px] px-6 md:px-12">
          <Separator />
        </div>

        {/* Section 1 — Pool models */}
        <section className="mx-auto max-w-[1600px] px-6 py-16 md:px-12 md:py-20">
          <Eyebrow>Section 1</Eyebrow>
          <h2 className="mt-4 font-serif text-3xl tracking-tight md:text-5xl">
            Proprietary Pool Models
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">
            These five models are original creations of Wonderlands World Experience LLC — not
            third-party manufacturer models. Each one is licensed as a product: the name, the
            design, the photographs and the catalog presentation, for{" "}
            <strong className="text-foreground">
              $10,000 per year per model, plus a 5% royalty
            </strong>{" "}
            on the sale price of each pool sold under that model.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {POOL_MODELS.map((model) => (
              <ModelCard key={model.name} model={model} />
            ))}
          </div>

          <div className="mt-20">
            <Eyebrow>Proprietary Image License</Eyebrow>
            <h3 className="mt-4 font-serif text-2xl tracking-tight md:text-3xl">
              Bermuda — the Wonderlands image
            </h3>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
              Bermuda is not a Wonderlands-designed model — the shell is a Latham manufacturer
              model. Wonderlands licenses here only what it owns: the proprietary image of the
              model and its presentation in the Wonderlands catalog, for{" "}
              <strong className="text-foreground">
                $10,000 per year, plus a 5% royalty
              </strong>{" "}
              on the sale price of each pool sold using that image.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <BermudaImageCard />
            </div>
          </div>

          <div className="mt-20">
            <Eyebrow>Proprietary Product License</Eyebrow>
            <h3 className="mt-4 font-serif text-2xl tracking-tight md:text-3xl">
              Natural Pool — the Wonderlands bespoke product
            </h3>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
              The Natural Pool is an original Wonderlands product: a fully custom freeform concrete
              sanctuary shaped around the terrain, with integrated water features. Wonderlands
              licenses the product — its name, design, photographs and catalog presentation — for{" "}
              <strong className="text-foreground">
                $10,000 per year, plus a 5% royalty
              </strong>{" "}
              on the price of each Natural Pool project sold.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <NaturalPoolCard />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1600px] px-6 md:px-12">
          <Separator />
        </div>

        {/* Section 2 — Software */}
        <section className="mx-auto max-w-[1600px] px-6 py-16 md:px-12 md:py-20">
          <Eyebrow>Section 2</Eyebrow>
          <h2 className="mt-4 font-serif text-3xl tracking-tight md:text-5xl">Software License</h2>

          <Card className="mt-10 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="font-serif text-2xl tracking-tight md:text-3xl">
                  Wonderlands Website Platform &amp; Software
                </CardTitle>
                <Badge variant="secondary">Wonderlands Tool</Badge>
              </div>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                The complete Wonderlands platform: the wonderlandsworld.com website system, the
                configuration and structure of its pages, the product and pool catalog with its
                prices, presentations and texts, and the Wonderlands Tool modules and tools —
                including the FLIP catalog, Genius, the quote and contract system, the procurement
                marketplace, booking and follow-up — together with its code, design, texts and
                images.
              </p>
            </CardHeader>
            <CardContent className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Published license pricing
                </p>
                <ul className="mt-4 divide-y divide-border border-y border-border">
                  {SOFTWARE_TIERS.map((tier) => (
                    <li key={tier.name} className="flex items-baseline justify-between py-3">
                      <span className="text-sm">{tier.name}</span>
                      <span className="font-serif text-lg">{tier.price}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  A license exists only with a document{" "}
                  <strong className="text-foreground">
                    signed by Wonderlands World Experience LLC
                  </strong>{" "}
                  and payment completed before use. Having been a client, prospect or contractor of
                  Wonderlands gives <strong className="text-foreground">no</strong> right of use.
                </p>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  <strong className="text-foreground">Ownership.</strong> All of the software, code,
                  design, catalog configuration and content are the property of Wonderlands World
                  Experience LLC, protected by U.S. copyright law (17 U.S.C.). {PROPRIETARY_SINCE}{" "}
                  No use transfers any ownership.
                </p>
                <div>
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <Ban className="h-4 w-4" /> Prohibited without a license
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      Copying the website, its structure, its catalog, its catalog prices or its
                      configuration for another company's site.
                    </li>
                    <li>Copying or reusing code, designs, texts or images of the platform.</li>
                    <li>
                      Cropping, editing or removing the Wonderlands logo or brand from any material.
                    </li>
                    <li>Presenting the platform, the catalog or the models as your own development.</li>
                  </ul>
                </div>
                <div>
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <Scale className="h-4 w-4" /> Unauthorized use — basis of the payment claim
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      The license fee for the entire period the material was used or displayed, at
                      the published monthly rate — $1,500 per month for the Full Suite, or the
                      product's own published monthly price;
                    </li>
                    <li>
                      The applicable royalties (on the proprietary models: 5% on sales made under
                      the model);
                    </li>
                    <li>
                      The profits obtained from the use, and the damages and remedies provided by
                      law (17 U.S.C. §§ 502–505), including an order to remove all of the material.
                    </li>
                  </ul>
                  <p className="mt-3">
                    The published fee is the measure of the value of the use: it is what any company
                    pays to use this legally. Whoever uses it without paying owes, at a minimum,
                    that same value for the entire time they used it.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer note / CTA */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-[1600px] px-6 py-16 text-center md:px-12">
            <FileText className="mx-auto h-6 w-6 text-muted-foreground" />
            <h2 className="mt-4 font-serif text-2xl tracking-tight md:text-3xl">
              Need a license?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Licenses are granted only in writing, signed by Wonderlands World Experience LLC.
              Contact us at sales@wonderlandsworld.com or 239-257-0637.
            </p>
            <div className="mt-8">
              <Link
                to="/consultation"
                className="border border-foreground px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Contact Wonderlands →
              </Link>
            </div>
            <p className="mt-10 text-xs text-muted-foreground">
              © Wonderlands World Experience LLC. All models, images and software on this page are
              proprietary.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Licenses;
