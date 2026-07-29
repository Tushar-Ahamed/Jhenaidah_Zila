import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function countUsers(supabaseAdmin: ReturnType<typeof createClient>, role: string, upazila?: string | null) {
  let query = supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", role);
  if (upazila) query = query.eq("upazila", upazila);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, password, name, role, committee_type, upazila, position, security_key, committee_code, approved_by } = await req.json();

    if (!email || !password || !name || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !caller) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role, upazila")
      .eq("id", caller.id)
      .maybeSingle();

    if (profileError || !callerProfile) {
      return new Response(
        JSON.stringify({ error: "Actor profile not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const actorRole = callerProfile.role as string;
    const actorUpazila = callerProfile.upazila as string | null;

    if (actorRole === "district_admin") {
      if (role === "district_admin" && (await countUsers(supabaseAdmin, "district_admin")) >= 2) {
        return new Response(JSON.stringify({ error: "দুইজন জেলা প্রশাসক ইতিমধ্যে আছে। আরও যোগ করা যাবে না।" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (role === "upazila_admin" && upazila && (await countUsers(supabaseAdmin, "upazila_admin", upazila)) >= 1) {
        return new Response(JSON.stringify({ error: `${upazila} উপজেলায় ইতিমধ্যে একজন উপজেলা প্রশাসক আছে।` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (role === "upazila_committee" && upazila && (await countUsers(supabaseAdmin, "upazila_committee", upazila)) >= 2) {
        return new Response(JSON.stringify({ error: `${upazila} উপজেলায় সর্বোচ্চ ২ জন উপজেলা কমিটি সদস্য তৈরি করা যাবে।` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } else if (actorRole === "upazila_admin") {
      if (role !== "upazila_committee") {
        return new Response(JSON.stringify({ error: "আপনি শুধু উপজেলা কমিটি সদস্য তৈরি করতে পারবেন।" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (committee_type !== "upazila") {
        return new Response(JSON.stringify({ error: "আপনি শুধু উপজেলা কমিটি তৈরি করতে পারবেন।" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (!actorUpazila || upazila !== actorUpazila) {
        return new Response(JSON.stringify({ error: "আপনি কেবল আপনার উপজেলা’র সদস্য তৈরি করতে পারবেন।" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (upazila && (await countUsers(supabaseAdmin, "upazila_committee", upazila)) >= 2) {
        return new Response(JSON.stringify({ error: `${upazila} উপজেলায় সর্বোচ্চ ২ জন উপজেলা কমিটি সদস্য তৈরি করা যাবে।` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } else {
      return new Response(JSON.stringify({ error: "আপনার এই পৃষ্ঠায় অ্যাক্সেস নেই।" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError || !newUser.user) {
      return new Response(
        JSON.stringify({ error: createError?.message ?? "Failed to create user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: newUser.user.id,
      name,
      email,
      role,
      committee_type: committee_type ?? null,
      upazila: committee_type === "district" ? null : upazila,
      position,
      status: "active",
      security_key: security_key ?? null,
      committee_code: committee_code ?? null,
      approved_by,
    });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: caller.id,
      actor_email: caller.email ?? "",
      actor_role: actorRole,
      action: "account_created",
      target_id: newUser.user.id,
      target_email: email,
      details: `Committee account: ${name} (${role})`,
    });

    return new Response(
      JSON.stringify({ uid: newUser.user.id, email }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
