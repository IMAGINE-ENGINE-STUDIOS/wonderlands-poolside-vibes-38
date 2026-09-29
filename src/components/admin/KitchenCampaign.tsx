import EditorialCampaign, { type EditorialField } from './EditorialCampaign';
import {
  KITCHEN_CAMPAIGN_DEFAULTS,
  buildKitchenCampaignHtml,
  buildKitchenCampaignSubject,
  type KitchenCampaignConfig,
} from '@/lib/email/kitchenCampaignTemplate';

/** Wonderlands Outdoor Kitchens — editorial luxury campaign email (admin panel). */
const FIELDS: EditorialField<KitchenCampaignConfig>[] = [
  { key: 'headline', label: 'Headline' },
  { key: 'subheadline', label: 'Subheadline' },
  { key: 'intro', label: 'Introduction', rows: 3 },
  { key: 'quote', label: 'Pull quote', rows: 2 },
  { key: 'islandTitle', label: 'Island title' },
  { key: 'islandCopy', label: 'Island copy', rows: 3 },
  { key: 'grillTitle', label: 'Grill title' },
  { key: 'grillCopy', label: 'Grill copy', rows: 3 },
  { key: 'loungeTitle', label: 'Dining title' },
  { key: 'loungeCopy', label: 'Dining copy', rows: 3 },
];

export default function KitchenCampaign() {
  return (
    <EditorialCampaign
      title="Wonderlands Outdoor Kitchens — Editorial Campaign"
      description="Luxury magazine email for outdoor kitchens with a free design offer. Personalised per client with their sales rep's signature."
      defaults={KITCHEN_CAMPAIGN_DEFAULTS}
      fields={FIELDS}
      buildHtml={buildKitchenCampaignHtml}
      buildSubject={buildKitchenCampaignSubject}
      scheduleKey="kitchens"
    />
  );
}
