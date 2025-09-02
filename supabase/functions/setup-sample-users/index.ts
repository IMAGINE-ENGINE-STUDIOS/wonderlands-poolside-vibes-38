import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Setting up sample users...');

    // Create sample supplier user in auth
    const { data: supplierAuth, error: supplierAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'supplier.demo@wonderlands.app',
      password: 'demo123456',
      email_confirm: true,
      user_metadata: {
        first_name: 'Demo',
        last_name: 'Supplier',
        role: 'supplier'
      }
    });

    if (supplierAuthError && !supplierAuthError.message.includes('already exists')) {
      console.error('Error creating supplier auth:', supplierAuthError);
    } else {
      console.log('Supplier auth user created or exists');
    }

    // Create sample contractor user in auth  
    const { data: contractorAuth, error: contractorAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'contractor.demo@wonderlands.app',
      password: 'demo123456',
      email_confirm: true,
      user_metadata: {
        first_name: 'Demo',
        last_name: 'Contractor',
        role: 'installer'
      }
    });

    if (contractorAuthError && !contractorAuthError.message.includes('already exists')) {
      console.error('Error creating contractor auth:', contractorAuthError);
    } else {
      console.log('Contractor auth user created or exists');
    }

    // Update/create profiles using auth user IDs
    if (supplierAuth?.user) {
      await supabaseAdmin.from('profiles').upsert({
        id: supplierAuth.user.id,
        email: 'supplier.demo@wonderlands.app',
        first_name: 'Demo',
        last_name: 'Supplier',
        company_name: 'Pool Supply Co',
        role: 'supplier',
        is_active: true
      });
      console.log('Supplier profile created/updated');
    }

    if (contractorAuth?.user) {
      await supabaseAdmin.from('profiles').upsert({
        id: contractorAuth.user.id,
        email: 'contractor.demo@wonderlands.app',
        first_name: 'Demo',
        last_name: 'Contractor',
        company_name: 'Premier Pool Installation',
        role: 'installer',
        is_active: true
      });
      console.log('Contractor profile created/updated');
    }

    // Create sample products for supplier
    if (supplierAuth?.user) {
      const sampleSupplierProducts = [
        {
          name: 'Pool Pump Motor',
          description: 'High-efficiency variable speed pool pump motor',
          price: 450.00,
          category: 'Equipment',
          subcategory: 'Pumps',
          brand: 'Hayward',
          sku: 'HAY-PUMP-001',
          stock_quantity: 25,
          supplier_id: supplierAuth.user.id,
          is_active: true
        },
        {
          name: 'Pool Filter Cartridge',
          description: 'Replacement filter cartridge for pool systems',
          price: 89.99,
          category: 'Maintenance',
          subcategory: 'Filters',
          brand: 'Pentair',
          sku: 'PEN-FILT-002',
          stock_quantity: 100,
          supplier_id: supplierAuth.user.id,
          is_active: true
        }
      ];

      for (const product of sampleSupplierProducts) {
        await supabaseAdmin.from('products').upsert(product, { onConflict: 'sku' });
      }
      console.log('Sample supplier products created');
    }

    // Create sample service offerings for contractor
    if (contractorAuth?.user) {
      const sampleContractorServices = [
        {
          name: 'Pool Installation',
          description: 'Complete in-ground pool installation service',
          category: 'Installation',
          base_price: 35000.00,
          user_id: contractorAuth.user.id,
          is_active: true
        },
        {
          name: 'Pool Equipment Repair',
          description: 'Repair and maintenance of pool equipment',
          category: 'Maintenance',
          base_price: 150.00,
          user_id: contractorAuth.user.id,
          is_active: true
        }
      ];

      for (const service of sampleContractorServices) {
        await supabaseAdmin.from('service_offerings').upsert(service, { onConflict: 'user_id,name' });
      }
      console.log('Sample contractor services created');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Sample users and data created successfully',
      credentials: {
        supplier: { email: 'supplier.demo@wonderlands.app', password: 'demo123456' },
        contractor: { email: 'contractor.demo@wonderlands.app', password: 'demo123456' }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in setup-sample-users function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});