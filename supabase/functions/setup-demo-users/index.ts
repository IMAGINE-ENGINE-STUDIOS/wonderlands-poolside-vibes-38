import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log("Creating demo user accounts...");

    // Demo users to create
    const demoUsers = [
      {
        email: "rikicot@hotmail.com",
        password: "MainAdmin!2025",
        userData: {
          first_name: "Ricardo",
          last_name: "Talavera",
          role: "main_admin"
        }
      },
      {
        email: "supplier@wonderlands.app",
        password: "Supplier!2025",
        userData: {
          first_name: "Demo",
          last_name: "Supplier", 
          role: "supplier",
          company_name: "Wonderlands Supply Co."
        }
      },
      {
        email: "installer@wonderlands.app",
        password: "Installer!2025",
        userData: {
          first_name: "Demo",
          last_name: "Installer",
          role: "installer", 
          company_name: "Wonderlands Installation Inc."
        }
      },
      {
        email: "consumer@wonderlands.app",
        password: "Consumer!2025",
        userData: {
          first_name: "Demo",
          last_name: "Consumer",
          role: "consumer"
        }
      }
    ];

    const results = [];

    // First, clean up old demo accounts that may exist
    const oldEmails = [
      'supplier.demo@wonderlands.app',
      'contractor.demo@wonderlands.app', 
      'admin@wonderland.com',
      'admin@wonderlandspools.com'
    ];

    for (const email of oldEmails) {
      try {
        console.log(`Cleaning up old account: ${email}`);
        const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = userData.users.find(user => user.email === email);
        if (existingUser) {
          await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
          console.log(`Deleted old user: ${email}`);
        }
      } catch (error) {
        console.log(`Could not delete old user ${email}:`, error.message);
      }
    }

    // Create/update demo users
    for (const demoUser of demoUsers) {
      try {
        console.log(`Processing user: ${demoUser.email}`);
        
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(user => user.email === demoUser.email);
        
        let userId: string;
        
        if (existingUser) {
          // Update existing user
          console.log(`Updating existing user: ${demoUser.email}`);
          
          const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
              password: demoUser.password,
              email_confirm: true,
              user_metadata: demoUser.userData
            }
          );
          
          if (updateError) {
            throw updateError;
          }
          
          userId = existingUser.id;
        } else {
          // Create new user
          console.log(`Creating new user: ${demoUser.email}`);
          
          const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: demoUser.email,
            password: demoUser.password,
            email_confirm: true,
            user_metadata: demoUser.userData
          });
          
          if (createError) {
            throw createError;
          }
          
          userId = data.user!.id;
        }
        
        // Update/create profile
        console.log(`Updating profile for: ${demoUser.email}`);
        const profileData = {
          id: userId,
          email: demoUser.email,
          first_name: demoUser.userData.first_name,
          last_name: demoUser.userData.last_name,
          role: demoUser.userData.role,
          is_active: true,
          ...(demoUser.userData.company_name && { company_name: demoUser.userData.company_name }),
          updated_at: new Date().toISOString()
        };
        
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert(profileData, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });
        
        if (profileError) {
          console.log(`Profile error for ${demoUser.email}:`, profileError);
          throw profileError;
        }
        
        results.push({
          email: demoUser.email,
          status: "success",
          action: existingUser ? "updated" : "created"
        });
        
      } catch (error) {
        console.error(`Error processing user ${demoUser.email}:`, error);
        results.push({
          email: demoUser.email,
          status: "error",
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Demo users setup completed",
        results: results,
        credentials: {
          "Main Admin": "rikicot@hotmail.com / MainAdmin!2025",
          "Supplier": "supplier@wonderlands.app / Supplier!2025", 
          "Installer": "installer@wonderlands.app / Installer!2025",
          "Consumer": "consumer@wonderlands.app / Consumer!2025"
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in setup-demo-users:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});