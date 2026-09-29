import EditorialCampaign, { type EditorialField } from './EditorialCampaign';
import {
  PATIO_ARRIVALS_DEFAULTS,
  buildPatioArrivalsHtml,
  buildPatioArrivalsSubject,
  type PatioArrivalsConfig,
} from '@/lib/email/patioArrivalsTemplate';

/** New Arrivals — outdoor kitchens & saunas editorial email (admin panel). */
const FIELDS: EditorialField<PatioArrivalsConfig>[] = [
  { key: 'headline', label: 'Headline' },
  { key: 'subheadline', label: 'Subheadline' },
  { key: 'intro', label: 'Introduction', rows: 3 },
  { key: 'kitchenTitle', label: 'Kitchen title' },
  { key: 'kitchenCopy', label: 'Kitchen copy', rows: 3 },
  { key: 'saunaTitle', label: 'Sauna title' },
  { key: 'saunaCopy', label: 'Sauna copy', rows: 3 },
];

export default function PatioArrivalsCampaign() {
  return (
    <EditorialCampaign
      title="New Arrivals — Outdoor Kitchens & Saunas"
      description={'Editorial magazine email: "Add on to your patio experience." Personalised per client with their sales rep\'s signature.'}
      defaults={PATIO_ARRIVALS_DEFAULTS as unknown as Record<string, unknown> & PatioArrivalsConfig}
      fields={FIELDS}
      buildHtml={buildPatioArrivalsHtml}
      buildSubject={buildPatioArrivalsSubject}
    />
  );
}
