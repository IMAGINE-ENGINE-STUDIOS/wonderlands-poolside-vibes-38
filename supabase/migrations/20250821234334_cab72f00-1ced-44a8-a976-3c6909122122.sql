-- Fix security definer function by making it more restrictive
DROP FUNCTION IF EXISTS get_installer_profile(UUID);

-- Create a safer function without SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_installer_profile_safe(installer_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
    result JSON;
BEGIN
    -- Only allow users to view their own profile or public data
    IF auth.uid() = installer_uuid OR is_main_admin() THEN
        SELECT json_build_object(
            'profile', row_to_json(ip.*),
            'licenses', COALESCE(
                (SELECT json_agg(row_to_json(il.*))
                 FROM public.installer_licenses il
                 WHERE il.installer_id = installer_uuid), '[]'::json
            ),
            'service_areas', COALESCE(
                (SELECT json_agg(
                    json_build_object(
                        'area', row_to_json(isa.*),
                        'location', row_to_json(fl.*)
                    )
                )
                 FROM public.installer_service_areas isa
                 JOIN public.florida_locations fl ON fl.id = isa.location_id
                 WHERE isa.installer_id = installer_uuid), '[]'::json
            )
        ) INTO result
        FROM public.installer_profiles ip
        WHERE ip.installer_id = installer_uuid;
    ELSE
        -- Return only public information for other users
        SELECT json_build_object(
            'profile', json_build_object(
                'company_name', ip.company_name,
                'service_radius', ip.service_radius,
                'rating', ip.rating,
                'total_reviews', ip.total_reviews
            ),
            'licenses', COALESCE(
                (SELECT json_agg(json_build_object(
                    'license_type', il.license_type,
                    'is_verified', il.is_verified
                ))
                 FROM public.installer_licenses il
                 WHERE il.installer_id = installer_uuid AND il.is_verified = true), '[]'::json
            ),
            'service_areas', COALESCE(
                (SELECT json_agg(
                    json_build_object(
                        'location', json_build_object(
                            'city', fl.city,
                            'county', fl.county,
                            'region', fl.region
                        )
                    )
                )
                 FROM public.installer_service_areas isa
                 JOIN public.florida_locations fl ON fl.id = isa.location_id
                 WHERE isa.installer_id = installer_uuid), '[]'::json
            )
        ) INTO result
        FROM public.installer_profiles ip
        WHERE ip.installer_id = installer_uuid;
    END IF;
    
    RETURN result;
END;
$$;