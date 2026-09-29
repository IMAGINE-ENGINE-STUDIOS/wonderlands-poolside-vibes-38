import EditorialCampaign, { type EditorialField } from './EditorialCampaign';
import {
  SOLAR_CAMPAIGN_DEFAULTS,
  buildSolarCampaignHtml,
  buildSolarCampaignSubject,
  type SolarCampaignConfig,
} from '@/lib/email/solarCampaignTemplate';

/** Wonderlands Solar — editorial luxury campaign email (admin panel). */
const FIELDS: EditorialField<SolarCampaignConfig>[] = [
  { key: 'headline', label: 'Headline' },
  { key: 'subheadline', label: 'Subheadline' },
  { key: 'intro', label: 'Introduction', rows: 3 },
  { key: 'quote', label: 'Pull quote', rows: 2 },
  { key: 'arrayTitle', label: 'Solar array title' },
  { key: 'arrayCopy', label: 'Solar array copy', rows: 3 },
  { key: 'batteryTitle', label: 'Battery title' },
  { key: 'batteryCopy', label: 'Battery copy', rows: 3 },
  { key: 'poolTitle', label: 'Pool heating title' },
  { key: 'poolCopy', label: 'Pool heating copy', rows: 3 },
];

export default function SolarCampaign() {
  return (
    <EditorialCampaign
      title="Wonderlands Solar — Editorial Campaign"
      description="Luxury magazine email for solar arrays, home batteries and solar pool heating, with a free roof study offer. Personalised per client with their sales rep's signature."
      defaults={SOLAR_CAMPAIGN_DEFAULTS as unknown as Record<string, unknown> & SolarCampaignConfig}
      fields={FIELDS}
      buildHtml={buildSolarCampaignHtml}
      buildSubject={buildSolarCampaignSubject}
    />
  );
}
