-- Make proposal-attachments bucket public so quotation URLs work
UPDATE storage.buckets SET public = true WHERE id = 'proposal-attachments';