-- Add licenses and locations support for installers
CREATE TABLE public.installer_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  installer_id UUID NOT NULL,
  license_type TEXT NOT NULL,
  license_number TEXT,
  expiration_date DATE,
  issuing_authority TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(installer_id, license_type, license_number)
);

-- Add Florida cities/regions table
CREATE TABLE public.florida_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  region TEXT NOT NULL,
  zip_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add installer service areas
CREATE TABLE public.installer_service_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  installer_id UUID NOT NULL,
  location_id UUID NOT NULL,
  travel_radius INTEGER DEFAULT 25, -- miles
  additional_fee NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(installer_id, location_id)
);

-- Enable RLS
ALTER TABLE public.installer_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.florida_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installer_service_areas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for installer_licenses
CREATE POLICY "Installers can manage their own licenses"
ON public.installer_licenses
FOR ALL
USING (installer_id = auth.uid())
WITH CHECK (installer_id = auth.uid());

CREATE POLICY "Public can view verified licenses"
ON public.installer_licenses
FOR SELECT
USING (is_verified = true);

CREATE POLICY "Admins can manage all licenses"
ON public.installer_licenses
FOR ALL
USING (is_main_admin())
WITH CHECK (is_main_admin());

-- RLS Policies for florida_locations
CREATE POLICY "Anyone can view Florida locations"
ON public.florida_locations
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage locations"
ON public.florida_locations
FOR ALL
USING (is_main_admin())
WITH CHECK (is_main_admin());

-- RLS Policies for installer_service_areas
CREATE POLICY "Installers can manage their service areas"
ON public.installer_service_areas
FOR ALL
USING (installer_id = auth.uid())
WITH CHECK (installer_id = auth.uid());

CREATE POLICY "Public can view service areas"
ON public.installer_service_areas
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage all service areas"
ON public.installer_service_areas
FOR ALL
USING (is_main_admin())
WITH CHECK (is_main_admin());

-- Add triggers for updated_at
CREATE TRIGGER update_installer_licenses_updated_at
BEFORE UPDATE ON public.installer_licenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some Florida locations
INSERT INTO public.florida_locations (city, county, region, zip_codes) VALUES
('Miami', 'Miami-Dade', 'South Florida', ARRAY['33101', '33102', '33125', '33126', '33127', '33128', '33129', '33130', '33131', '33132', '33133', '33134', '33135', '33136', '33137', '33138', '33139', '33140', '33141', '33142', '33143', '33144', '33145', '33146', '33147', '33150', '33151', '33152', '33153', '33154', '33155', '33156', '33157', '33158', '33160', '33161', '33162', '33163', '33164', '33165', '33166', '33167', '33168', '33169', '33170', '33172', '33173', '33174', '33175', '33176', '33177', '33178', '33179', '33180', '33181', '33182', '33183', '33184', '33185', '33186', '33187', '33189', '33190', '33191', '33192', '33193', '33194', '33195', '33196', '33197', '33198', '33199']),
('Orlando', 'Orange', 'Central Florida', ARRAY['32789', '32790', '32792', '32793', '32794', '32795', '32796', '32797', '32798', '32801', '32802', '32803', '32804', '32805', '32806', '32807', '32808', '32809', '32810', '32811', '32812', '32814', '32815', '32816', '32817', '32818', '32819', '32820', '32821', '32822', '32824', '32825', '32826', '32827', '32828', '32829', '32830', '32831', '32832', '32833', '32834', '32835', '32836', '32837', '32839', '32853', '32854', '32855', '32856', '32857', '32858', '32859', '32860', '32861', '32862', '32867', '32868', '32869', '32872', '32877', '32878', '32885', '32886', '32887', '32891', '32896', '32897', '32898', '32899']),
('Tampa', 'Hillsborough', 'Central Florida', ARRAY['33601', '33602', '33603', '33604', '33605', '33606', '33607', '33608', '33609', '33610', '33611', '33612', '33613', '33614', '33615', '33616', '33617', '33618', '33619', '33620', '33621', '33622', '33623', '33624', '33625', '33626', '33629', '33630', '33631', '33633', '33634', '33635', '33637', '33647', '33650', '33655', '33660', '33661', '33662', '33663', '33664', '33672', '33673', '33674', '33675', '33677', '33679', '33680', '33681', '33682', '33684', '33685', '33686', '33687', '33688', '33689', '33694', '33695', '33696', '33697']),
('Jacksonville', 'Duval', 'Northeast Florida', ARRAY['32099', '32201', '32202', '32203', '32204', '32205', '32206', '32207', '32208', '32209', '32210', '32211', '32212', '32214', '32216', '32217', '32218', '32219', '32220', '32221', '32222', '32223', '32224', '32225', '32226', '32227', '32228', '32229', '32230', '32231', '32232', '32233', '32234', '32235', '32236', '32237', '32238', '32239', '32244', '32245', '32246', '32247', '32250', '32254', '32255', '32256', '32257', '32258', '32259', '32260', '32266', '32267', '32277', '32290']),
('Fort Lauderdale', 'Broward', 'South Florida', ARRAY['33301', '33302', '33303', '33304', '33305', '33306', '33307', '33308', '33309', '33310', '33311', '33312', '33313', '33314', '33315', '33316', '33317', '33318', '33319', '33320', '33321', '33322', '33323', '33324', '33325', '33326', '33327', '33328', '33329', '33330', '33331', '33332', '33334', '33335', '33336', '33337', '33338', '33339', '33340', '33345', '33346', '33348', '33349', '33351', '33355', '33359', '33388', '33394']),
('St. Petersburg', 'Pinellas', 'Central Florida', ARRAY['33701', '33702', '33703', '33704', '33705', '33706', '33707', '33708', '33709', '33710', '33711', '33712', '33713', '33714', '33715', '33716', '33730', '33731', '33732', '33733', '33734', '33736', '33738', '33740', '33741', '33742', '33743', '33747', '33755', '33756', '33759', '33760', '33761', '33762', '33763', '33764', '33765', '33767', '33769', '33770', '33771', '33772', '33773', '33774', '33775', '33776', '33777', '33778', '33781', '33782', '33785', '33786', '33787']),
('Hialeah', 'Miami-Dade', 'South Florida', ARRAY['33010', '33012', '33013', '33014', '33015', '33016', '33017', '33018']),
('Tallahassee', 'Leon', 'North Florida', ARRAY['32301', '32302', '32303', '32304', '32305', '32306', '32307', '32308', '32309', '32310', '32311', '32312', '32313', '32314', '32315', '32316', '32317', '32318', '32395', '32399']),
('Port St. Lucie', 'St. Lucie', 'Southeast Florida', ARRAY['34952', '34953', '34983', '34984', '34986', '34987', '34988']),
('Cape Coral', 'Lee', 'Southwest Florida', ARRAY['33904', '33909', '33910', '33914', '33915', '33916', '33917', '33918', '33919', '33920', '33921', '33922', '33990', '33991', '33993']);

-- Function to get installer with licenses and service areas
CREATE OR REPLACE FUNCTION get_installer_profile(installer_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result JSON;
BEGIN
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
    
    RETURN result;
END;
$$;