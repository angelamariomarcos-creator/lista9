type CestaItemForMessage = {
  comentario_ia: string | null;
  products: {
    nombre: string;
    emoji: string;
  } | null;
};

function construirMensaje(items: CestaItemForMessage[]): string {
  if (items.length === 0) {
    return "La cesta está vacía, Senior Rex no tiene nada que enviar.";
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

export function generarLinkWhatsApp(items: CestaItemForMessage[]): string {
  const mensaje = construirMensaje(items);
  const mensajeCodificado = encodeURIComponent(mensaje);
  
  // Al no incluir ningún número, WhatsApp abrirá la agenda del usuario para elegir destinatario
  return `https://api.whatsapp.com/send/?text=${mensajeCodificado}`;
}