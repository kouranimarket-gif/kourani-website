export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  try {
    const data = await req.json();

    const merchantHTML = `
      <h2>Nouvelle demande client</h2>
      <table border="1" cellpadding="8" cellspacing="0">
        <tr><td><strong>Entreprise</strong></td><td>${data.businessName || ""}</td></tr>
        <tr><td><strong>Nom</strong></td><td>${data.contactName || ""}</td></tr>
        <tr><td><strong>Email</strong></td><td>${data.email || ""}</td></tr>
        <tr><td><strong>Téléphone</strong></td><td>${data.phone || ""}</td></tr>
        <tr><td><strong>Produits</strong></td><td>${data.productsNeeded || ""}</td></tr>
        <tr><td><strong>Notes</strong></td><td>${data.notes || ""}</td></tr>
      </table>
    `;

    // EMAIL COMMERÇANT
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Kourani Market <onboarding@resend.dev>",
        to: ["kouranimarket@gmail.com"],
        subject: "Nouvelle demande business",
        html: merchantHTML
      })
    });

    // EMAIL CLIENT
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Kourani Market <onboarding@resend.dev>",
        to: [data.email],
        subject: "Demande reçue",
        html: `
          <p>Bonjour ${data.contactName || ""},</p>
          <p>Nous avons bien reçu votre demande.</p>
          <p>Nous vous contacterons rapidement avec une offre personnalisée.</p>
        `
      })
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }
};