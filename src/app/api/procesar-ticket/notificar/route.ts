import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { producto, familia_id } = await request.json();

  const supabase = createClient();

  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("family_id", familia_id);

  if (!tokens || tokens.length === 0) {
    return NextResponse.json({ ok: true, enviados: 0 });
  }

  const accessToken = await getFirebaseAccessToken();

  const resultados = await Promise.allSettled(
    tokens.map((t) =>
      fetch(
        `https://fcm.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/messages:send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: {
              token: t.token,
              notification: {
                title: "🦖 Lista de la Compra",
                body: `Se ha añadido ${producto} a la cesta`,
              },
              webpush: {
                notification: {
                  icon: "https://lista9.vercel.app/rex-yes.png",
                },
              },
            },
          }),
        }
      )
    )
  );

  const enviados = resultados.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ ok: true, enviados });
}

async function getFirebaseAccessToken(): Promise<string> {
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!),
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token!;
}