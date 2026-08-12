interface InstallationNoteProps {
  className?: string;
}

/**
 * Editorial disclaimer shown on every product card:
 * pricing is turnkey and includes installation at the client's address.
 */
const InstallationNote = ({ className = "" }: InstallationNoteProps) => (
  <p className={`quote-eyebrow !tracking-[0.18em] leading-relaxed ${className}`}>
    Price includes installation at your home address
  </p>
);

export default InstallationNote;
