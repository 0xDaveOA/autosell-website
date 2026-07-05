import { NextResponse } from "next/server";
import { after } from "next/server";
import {
  buildRentalSignupRows,
  formatSupabaseInsertError,
  RENTAL_SIGNUP_MAX_PHOTOS_PER_VEHICLE,
  RENTAL_SIGNUP_MAX_VEHICLES,
} from "@/lib/rental-partner-insert";
import type { RentalPartnerInsertInput, RentalVehicleInsertInput } from "@/lib/rental-partner-insert";
import { createServiceSupabase } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { notifyNewRentalPartner } from "@/lib/notify-rental-email";

export const runtime = "nodejs";

type SignupBody = {
  partner?: Partial<RentalPartnerInsertInput>;
  vehicles?: Partial<RentalVehicleInsertInput>[];
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected a JSON object." }, { status: 400 });
  }

  const { partner, vehicles } = body as SignupBody;
  if (!partner || typeof partner !== "object") {
    return NextResponse.json({ error: "Missing business info." }, { status: 400 });
  }
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return NextResponse.json({ error: "Add at least one vehicle to your fleet." }, { status: 400 });
  }
  if (vehicles.length > RENTAL_SIGNUP_MAX_VEHICLES) {
    return NextResponse.json(
      { error: `At most ${RENTAL_SIGNUP_MAX_VEHICLES} vehicles are allowed per signup.` },
      { status: 400 }
    );
  }
  for (const v of vehicles) {
    if (Array.isArray(v.photos) && v.photos.length > RENTAL_SIGNUP_MAX_PHOTOS_PER_VEHICLE) {
      return NextResponse.json(
        { error: `At most ${RENTAL_SIGNUP_MAX_PHOTOS_PER_VEHICLE} photos are allowed per vehicle.` },
        { status: 400 }
      );
    }
  }

  const built = buildRentalSignupRows(
    partner as RentalPartnerInsertInput,
    vehicles as RentalVehicleInsertInput[]
  );
  if (!built.ok) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  const service = createServiceSupabase();
  if (!service) {
    return NextResponse.json(
      {
        error: "NO_SERVICE_ROLE",
        message:
          "Rental signups are not enabled on the server. Add SUPABASE_SERVICE_ROLE_KEY to your deployment environment.",
      },
      { status: 503 }
    );
  }

  // Attach user_id if a Supabase session exists in cookies
  let userId: string | null = null;
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    userId = user?.id ?? null;
  } catch { /* no session — anonymous submission is fine */ }

  const partnerRow = userId ? { ...built.partnerRow, user_id: userId } : built.partnerRow;

  const { data: partnerData, error: partnerError } = await service
    .from("rental_partners")
    .insert([partnerRow])
    .select("id")
    .maybeSingle();

  if (partnerError || !partnerData) {
    return NextResponse.json(
      { error: formatSupabaseInsertError(partnerError ?? { message: "Could not create partner." }) },
      { status: 422 }
    );
  }

  const partnerId = partnerData.id as number;
  const vehicleRows = built.vehicleRows.map((row) => ({ ...row, partner_id: partnerId }));

  const { data: vehicleData, error: vehicleError } = await service
    .from("rental_listings")
    .insert(vehicleRows)
    .select("id");

  if (vehicleError) {
    // Compensating delete: avoid leaving a partner with zero vehicles from a half-failed submit.
    await service.from("rental_partners").delete().eq("id", partnerId);
    return NextResponse.json({ error: formatSupabaseInsertError(vehicleError) }, { status: 422 });
  }

  after(() =>
    notifyNewRentalPartner({
      partner: partner as RentalPartnerInsertInput,
      vehicles: vehicles as RentalVehicleInsertInput[],
      partnerId,
    })
  );

  return NextResponse.json({
    ok: true,
    partnerId,
    vehicleIds: (vehicleData ?? []).map((v) => v.id as number),
  });
}
