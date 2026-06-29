import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { imageBase64, mediaType } = await request.json();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageBase64 },
            },
            {
              type: "text",
              text: `Analiza este ticket de supermercado. Devuelve SOLO un JSON valido, sin markdown ni texto adicional, con esta forma exacta:
{
  "total": 0,
  "items": [
    { "nombre": "string", "categoria": "string", "precio": 0 }
  ]
}
Las categorias deben ser una de: Bebidas, Limpieza, Carne, Pescado, Fruteria, Lacteos, Despensa, Higiene, Otros.`,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  const textoRespuesta = data.content?.[0]?.text ?? "{}";
  const limpio = textoRespuesta.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(limpio);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "No se pudo leer el ticket" }, { status: 500 });
  }
}