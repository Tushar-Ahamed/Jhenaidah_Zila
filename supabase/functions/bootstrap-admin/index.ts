import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    if (req.method === "GET") {
      // Check if any admin exists already
      const { count } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .in("role", ["upazila_admin", "district_admin"]);

      const adminExists = (count ?? 0) > 0;
      return new Response(
        JSON.stringify({ adminExists }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST — bootstrap the first admin
    const { email, password, name } = await req.json();
    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if any admin already exists
    const { count } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .in("role", ["upazila_admin", "district_admin"]);

    if ((count ?? 0) > 0) {
      return new Response(
        JSON.stringify({ error: "Admin already exists. Use the admin login instead." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError || !newUser.user) {
      return new Response(
        JSON.stringify({ error: createError?.message ?? "Failed to create admin" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the profile as district_admin / active
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: newUser.user.id,
      name,
      email,
      role: "district_admin",
      committee_type: "district",
      upazila: null,
      position: "জেলা প্রশাসক",
      status: "active",
      approved_by: newUser.user.id,
    });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: newUser.user.id,
      actor_email: email,
      actor_role: "district_admin",
      action: "account_created",
      target_id: newUser.user.id,
      target_email: email,
      details: "Bootstrap admin (first district_admin)",
    });

    return new Response(
      JSON.stringify({ uid: newUser.user.id, email }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
