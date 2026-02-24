

# Send Spa+Sauna+Fireplace Bundle Offer to All Clients

## What will happen

1. A "Send Email Blast" button will be added to each promotion row in the Admin Promotions Manager table
2. Clicking it triggers the existing `send-bulk-email` Edge Function with the matching email template name ("Spa + Sauna + Fireplace Bundle $40K")
3. A confirmation dialog will appear before sending, showing how many clients will receive the email
4. Progress/results feedback will be displayed after the send completes

## Technical Details

### File: `src/components/admin/AdminPromotionsManager.tsx`

- Add a `Mail` icon import from lucide-react
- Add state for bulk email sending (`isSendingEmail`, `sendingPromotionId`)
- Add a `handleSendBulkEmail(promotion)` function that:
  1. Shows a confirmation prompt
  2. Calls `supabase.functions.invoke('send-bulk-email', { body: { template_name: promotion.name, send_to_all: true } })`
  3. Displays a toast with the results (X sent, Y failed)
- Add a new "Send to All Clients" button (mail icon) in the Actions column of each promotion row, next to Edit and Delete
- The button will show a loading spinner while sending and be disabled for inactive promotions

### No database changes needed
The `send-bulk-email` Edge Function and `message_templates` table already have the template registered. The function fetches all clients when no `client_ids` are provided.

### No new files needed
All changes are within the existing `AdminPromotionsManager.tsx` component.

