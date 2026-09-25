export async function onRequestGet(context) {
  const certificate = context.env.QZ_CERTIFICATE;

  if (!certificate) {
    return new Response("QZ_CERTIFICATE no está configurado", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return new Response(certificate, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}