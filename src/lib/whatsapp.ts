type CestaItemForMessage = {
  comentario_ia: string | null;
  products: {
    nombre: string;
    emoji: string;
  } | null;
};

const NUMERO_JAVI = "34669558210";
const NUMERO_VANE = "34626248847";

function construirMensaje(items: CestaItemForMessage[]): string {
  if (items.length === 0) {
    return "La cesta esta vacia, Senior Rex no tiene nada que enviar.";
  }

  const lineas = items.map((item) => {
    const emoji = item.products?.emoji ?? "";
    const nombre = item.products?.nombre ?? "Producto";
    const frase = item.comentario_ia ? ` - "${item.comentario_ia}"` : "";
    return `${emoji} ${nombre}${frase}`;
  });

  return [
    "LISTA DE LA COMPRA",
    "------------------",
    ...lineas,
    "------------------",
    `${items.length} productos - Generada por Senior Rex`,
  ].join("\n");
}

export function generarLinkWhatsApp(
  items: CestaItemForMessage[],
  destinatario: "javi" | "vane"
): string {
  const numero = destinatario === "javi" ? NUMERO_JAVI : NUMERO_VANE;
  const mensaje = construirMensaje(items);
  const mensajeCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${numero}?text=${mensajeCodificado}`;
}