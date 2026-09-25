function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);

  let binary = "";

  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

export async function onRequestPost(context) {
  try {
    const privateKey = context.env.QZ_PRIVATE_KEY;

    if (!privateKey) {
      return new Response("QZ_PRIVATE_KEY no está configurado", {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      return new Response(
        "El formato de QZ_PRIVATE_KEY no es compatible. Se esperaba una clave PKCS#8.",
        {
          status: 500,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const dataToSign = await context.request.text();

    if (!dataToSign) {
      return new Response("No se han recibido datos para firmar", {
        status: 400,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    const keyData = pemToArrayBuffer(privateKey);

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      keyData,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-512",
      },
      false,
      ["sign"]
    );

    const encodedData = new TextEncoder().encode(dataToSign);

    const signature = await crypto.subtle.sign(
      {
        name: "RSASSA-PKCS1-v1_5",
      },
      cryptoKey,
      encodedData
    );

    return new Response(arrayBufferToBase64(signature), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error firmando petición QZ:", error);

    return new Response("Error al firmar la petición QZ", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}