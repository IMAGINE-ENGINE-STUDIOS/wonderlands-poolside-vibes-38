import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Links — every route that exists on wonderlandsworld.com, in one page.
 * The list mirrors the app's own route table (src/App.tsx) one for one,
 * counted and reconciled against it. Entries whose path carries a pattern
 * (shown with :name) open a specific record, book, project or room, so
 * they are listed by their pattern exactly as the router defines them.
 * Role-gated pages are listed too; access stays gated exactly as before.
 */

interface LinkEntry {
  path: string;
  label: string;
}

interface LinkGroup {
  title: string;
  entries: LinkEntry[];
}

const GROUPS: LinkGroup[] = [
  {
    title: "Wonderlands World",
    entries: [
      { path: "/", label: "Home" },
      { path: "/about", label: "About" },
      { path: "/consultation", label: "Consultation" },
      { path: "/investors", label: "Investor Data Room" },
      { path: "/deck", label: "Investor Deck" },
      { path: "/licenses", label: "Licenses" },
      { path: "/technology", label: "Technology" },
      { path: "/tech-stack", label: "Tech Stack" },
      { path: "/referral", label: "Referral Portal" },
      { path: "/api", label: "API Documentation" },
      { path: "/links", label: "Links — every page on this site" },
      { path: "/consent", label: "Consent" },
      { path: "/unsubscribe", label: "Unsubscribe" },
    ],
  },
  {
    title: "Suites",
    entries: [
      { path: "/suites/pools-and-spas", label: "Pools and Spas Suite" },
      { path: "/suites/spas", label: "Spas Suite" },
      { path: "/suites/saunas", label: "Saunas Suite" },
      { path: "/suites/tanning-ledges", label: "Tanning Ledges Suite" },
      { path: "/suites/enclosures", label: "Enclosures Suite" },
      { path: "/suites/lanai", label: "Lanai Suite" },
      { path: "/suites/fencing", label: "Fencing Suite" },
      { path: "/suites/flooring", label: "Flooring Suite" },
      { path: "/suites/:category", label: "Suite by category" },
    ],
  },
  {
    title: "Tools and Studios",
    entries: [
      { path: "/design-studio", label: "Design Studio" },
      { path: "/studio-3d", label: "3D Studio" },
      { path: "/studio", label: "Studio" },
      { path: "/studio-showroom", label: "Studio Showroom" },
      { path: "/wonderlands-studio", label: "Wonderlands Studio" },
      { path: "/belgard-studio", label: "Belgard Studio" },
      { path: "/belgard-products", label: "Belgard Products" },
      { path: "/blueprint-builder", label: "Blueprint Builder" },
      { path: "/global-design-board", label: "Global Design Board" },
      { path: "/global-design-board-v2", label: "Global Design Board V2" },
      { path: "/solar-board", label: "Solar Board" },
      { path: "/solar-genius", label: "Solar Genius" },
      { path: "/design", label: "Design Proposals" },
      { path: "/tools", label: "Tools" },
      { path: "/tools2", label: "Tools 2" },
      { path: "/asset-gallery", label: "Asset Gallery" },
      { path: "/product-manual", label: "Product Manual" },
      { path: "/website-builder", label: "Website Builder" },
      { path: "/flip", label: "Flip Lab" },
      { path: "/flip-pages", label: "Flip Pages" },
      { path: "/live-flip", label: "Live Flip Book" },
    ],
  },
  {
    title: "Quotes, Projects and Live",
    entries: [
      { path: "/quote", label: "Quote Tool" },
      { path: "/pool-calculator", label: "Pool Calculator" },
      { path: "/checkout", label: "Checkout" },
      { path: "/invoice/:invoiceId", label: "Invoice" },
      { path: "/project/:token", label: "Shared Project" },
      { path: "/project/internal/:token", label: "Internal Project" },
      { path: "/gallery/:token", label: "Shared Gallery" },
      { path: "/offer/:id", label: "Offer" },
      { path: "/flip/:slug", label: "Flip Book" },
      { path: "/sites/:slug", label: "Company Site" },
      { path: "/sites/:slug/:pageSlug", label: "Company Site Page" },
      { path: "/:slug", label: "Flip Book by name (flip subdomain)" },
      { path: "/live", label: "Live Lobby" },
      { path: "/live/:slug", label: "Live Room" },
      { path: "/landscaping", label: "Landscaping" },
      { path: "/Landscaping", label: "Landscaping (capital L)" },
    ],
  },
  {
    title: "Account and Work",
    entries: [
      { path: "/auth", label: "Sign In" },
      { path: "/auth/reset-password", label: "Reset Password" },
      { path: "/account", label: "My Account" },
      { path: "/workspace", label: "Company Workspace" },
      { path: "/files", label: "Client Files" },
      { path: "/jobs", label: "Jobs" },
      { path: "/procurement", label: "Procurement" },
      { path: "/socialite", label: "Socialite" },
    ],
  },
  {
    title: "Contractors and Sales",
    entries: [
      { path: "/contractor-login", label: "Contractor Sign In" },
      { path: "/contractor-registration", label: "Contractor Registration" },
      { path: "/contractor-profile/:id", label: "Contractor Profile" },
      { path: "/sales-rep", label: "Sales Rep Dashboard" },
      { path: "/sales-rep-login", label: "Sales Rep Sign In" },
      { path: "/sales-rep-register", label: "Sales Rep Registration" },
    ],
  },
  {
    title: "Admin",
    entries: [
      { path: "/admin", label: "Admin Dashboard" },
      { path: "/admin/command-center", label: "Command Center" },
      { path: "/admin/socialite", label: "Socialite (admin)" },
      { path: "/admin/preview/:view", label: "Admin Preview" },
      { path: "/admin/quotes/:quoteId", label: "Quote Detail" },
      { path: "/admin/invoices/:invoiceId", label: "Invoice Detail" },
      { path: "/content-editor", label: "Content Editor" },
      { path: "/template", label: "Ecommerce Template" },
      { path: "/demo/command-center", label: "Command Center Demo" },
      { path: "/dev/command-center", label: "Dev Command Center" },
      { path: "/twilio-poc", label: "Twilio POC" },
    ],
  },
];

// +1 for the standalone Contract page listed below the groups.
const TOTAL = GROUPS.reduce((n, g) => n + g.entries.length, 0) + 1;

const Links: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Links — Wonderlands World</title>
        <meta
          name="description"
          content="Every page, suite, tool and studio on wonderlandsworld.com, in one place."
        />
      </Helmet>
      <Header />
      <main className="mx-auto w-full max-w-5xl px-6 py-14">
        <h1 className="text-4xl font-semibold tracking-tight">Links</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Every page, suite, tool and studio on wonderlandsworld.com — {TOTAL}{" "}
          links in all. Pages that ask you to sign in still do; nothing here
          changes who can open what.
        </p>

        {GROUPS.map((group) => (
          <section key={group.title} className="mt-12">
            <h2 className="border-b border-border pb-2 text-xl font-semibold">
              {group.title}
            </h2>
            <ul className="mt-2 divide-y divide-border/60">
              {group.entries.map((entry) => (
                <li
                  key={entry.path}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 py-2.5"
                >
                  <Link
                    to={entry.path}
                    className="text-base font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {entry.label}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {entry.path}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-12">
          <h2 className="border-b border-border pb-2 text-xl font-semibold">
            Standalone
          </h2>
          <ul className="mt-2 divide-y divide-border/60">
            <li className="flex flex-wrap items-baseline justify-between gap-x-6 py-2.5">
              <a
                href="/contract.html"
                className="text-base font-medium text-primary underline-offset-4 hover:underline"
              >
                Contract
              </a>
              <span className="text-sm text-muted-foreground">
                /contract.html
              </span>
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Links;
