-- Follow up to 20261117201500_gonzalez_diag_probe.sql (2026-11-17).
-- Drops the temporary diagnostic function gonzalez_diag now that the
-- González procurement load is verified. Run only after the corrected
-- loader (20261117210000_gonzalez_procurement_areas_fixed.sql) has been
-- applied and its results checked.

DROP FUNCTION IF EXISTS public.gonzalez_diag();
