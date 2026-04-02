export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    prenom, nom, email, tel, pays,
    sujet, notes, directeur, directeur_role,
    date, heure, lang,
    type, format, budget, vision
  } = req.body;

  const isCommission = !!vision;
  const clientName = `${prenom} ${nom}`;
  const fromEmail = process.env.EMAIL_EXPEDITEUR || 'onboarding@resend.dev';

  const teamSubject = isCommission
    ? `Nouvelle demande de commission — ${clientName}`
    : `Nouveau RDV — ${clientName} avec ${directeur}`;

  const teamBody = `
    <h2>${teamSubject}</h2>
    <p><strong>Client :</strong> ${clientName}</p>
    <p><strong>Email :</strong> ${email}</p>
    <p><strong>Téléphone :</strong> ${tel || '—'}</p>
    <p><strong>Pays :</strong> ${pays || '—'}</p>
    ${!isCommission ? `
    <p><strong>Directeur :</strong> ${directeur} — ${directeur_role}</p>
    <p><strong>Date :</strong> ${date} à ${heure}</p>
    <p><strong>Sujet :</strong> ${sujet || '—'}</p>
    <p><strong>Notes :</strong> ${notes || '—'}</p>
    ` : `
    <p><strong>Type :</strong> ${type || '—'}</p>
    <p><strong>Format :</strong> ${format || '—'}</p>
    <p><strong>Budget :</strong> ${budget || '—'}</p>
    <p><strong>Vision :</strong> ${vision || '—'}</p>
    `}
  `;

  const clientSubject = `KENZ ZNICA — Confirmation de votre rendez-vous`;
  const clientBody = `
    <h2>Bonjour ${prenom},</h2>
    <p>Votre rendez-vous est confirmé.</p>
    ${!isCommission ? `
    <p><strong>Date :</strong> ${date} à ${heure}</p>
    <p><strong>Avec :</strong> ${directeur}</p>
    ` : `
    <p>Najat Toubal vous contactera dans les 48h.</p>
    `}
    <p>À bientôt,<br>L'équipe KENZ ZNICA</p>
  `;

  const sendEmail = async (to, subject, html) => {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `KENZ ZNICA <${fromEmail}>`,
        to: [to],
        subject,
        html
      })
    });
    return r;
  };

  try {
    await sendEmail('fouedtaffar@outlook.com', teamSubject, teamBody);
    await sendEmail('fouedtaffar@outlook.com', clientSubject, clientBody);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('rdv.js error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
