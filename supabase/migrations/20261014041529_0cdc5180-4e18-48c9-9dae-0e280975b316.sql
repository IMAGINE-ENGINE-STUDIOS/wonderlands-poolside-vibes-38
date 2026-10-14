CREATE OR REPLACE FUNCTION public.add_shared_project_document(_token text, _item_id uuid, _file_name text, _file_url text, _file_type text, _file_size bigint)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  IF _token IS NULL OR length(_token) < 8 THEN RAISE EXCEPTION 'invalid link'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM phase_items i JOIN project_phases ph ON ph.id = i.phase_id
    JOIN construction_projects p ON p.id = ph.project_id
    WHERE i.id = _item_id AND (p.share_token = _token OR p.internal_share_token = _token)
  ) THEN RAISE EXCEPTION 'invalid link'; END IF;
  INSERT INTO item_documents(item_id, file_name, file_url, file_type, file_size)
  VALUES (_item_id, left(_file_name, 255), _file_url, left(_file_type, 120), _file_size) RETURNING id INTO _id;
  RETURN _id;
END $$;
GRANT EXECUTE ON FUNCTION public.add_shared_project_document(text, uuid, text, text, text, bigint) TO anon, authenticated;

CREATE POLICY "Shared link visitors upload project documents" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'project-documents'
  AND EXISTS (SELECT 1 FROM public.construction_projects p
              WHERE p.id::text = (storage.foldername(name))[1]
                AND (p.share_token IS NOT NULL OR p.internal_share_token IS NOT NULL))
);