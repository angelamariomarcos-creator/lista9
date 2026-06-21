import { createClient } from "@/lib/supabase";

/**
 * Elige una frase de humor aleatoria que el producto indicado
 * todavía no haya usado antes (consultando su historial en la tabla cesta).
 * Si ya ha usado todas las frases disponibles, vuelve a empezar desde cero.
 */
export async function elegirFraseSinRepetir(productId: string): Promise<string> {
  const supabase = createClient();

  // 1. Frases que este producto ya ha usado antes
  const { data: usadas } = await supabase
    .from("cesta")
    .select("comentario_ia")
    .eq("product_id", productId)
    .not("comentario_ia", "is", null);

  const textosUsados = new Set(
    (usadas ?? []).map((row) => row.comentario_ia as string)
  );

  // 2. Todas las frases disponibles en el banco
  const { data: todasLasFrases } = await supabase
    .from("frases_humor")
    .select("texto");

  const banco = (todasLasFrases ?? []).map((f) => f.texto as string);

  if (banco.length === 0) {
    return "¡Senior Rex se ha quedado sin frases, recarga el banco!";
  }

  // 3. Frases que ESTE producto aún no ha usado
  let disponibles = banco.filter((frase) => !textosUsados.has(frase));

  // 4. Si ya las ha usado todas, reseteamos y usamos el banco completo otra vez
  if (disponibles.length === 0) {
    disponibles = banco;
  }

  // 5. Elegimos una al azar
  const elegida = disponibles[Math.floor(Math.random() * disponibles.length)];
  return elegida;
}