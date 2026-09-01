import * as React from "react";
import { Link } from "react-router-dom";
import EditorialSectionHeader from "@/components/EditorialSectionHeader";
import { ArrowUpRight } from "lucide-react";

/**
 * SuiteEntryHeader — editorial section header with an elegant entry button into
 * the matching product suite (`/suites/...`). Used by the main-page sections so
 * every category has one consistent, magazine-style way into its full suite.
 */
interface SuiteEntryHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  /** Suite route, e.g. "/suites/spas" */
  suiteHref: string;
  suiteLabel: string;
}

const SuiteEntryHeader = ({
  eyebrow,
  title,
  description,
  suiteHref,
  suiteLabel,
}: SuiteEntryHeaderProps) => (
  <div className="mb-10">
    <EditorialSectionHeader eyebrow={eyebrow} title={title} description={description} />
    <div className="mt-6 border-t border-border/60 pt-6">
      <Link
        to={suiteHref}
        className="group inline-flex items-center gap-3 border border-foreground/25 px-6 py-3 text-[10px] uppercase tracking-[0.3em] text-foreground transition-all duration-300 hover:border-foreground/60 hover:bg-foreground hover:text-background"
      >
        {suiteLabel}
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </div>
  </div>
);

export default SuiteEntryHeader;
