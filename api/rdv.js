// api/rdv.js — KENZ ZNICA
// Reçoit données RDV / commission, envoie 2 emails via Resend :
// 1. Email HTML élégant à l'équipe KENZ ZNICA
// 2. Email de confirmation au client (si email fourni)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    prenom, nom, email, tel, pays,
    sujet, notes, directeur, directeur_role,
    date, heure, lang,
    // Commission art
    type, format, budget, vision
  } = req.body;

  const isCommission = !!vision; // détecte si c'est une demande de commission artistique
  const clientName = `${prenom} ${nom}`;
  const teamEmail = process.env.EMAIL_DESTINATAIRE;
  const fromEmail = process.env.EMAIL_EXPEDITEUR || 'contact@kenzznica.com';

  // ── EMAIL ÉQUIPE ──
  const teamSubject = isCommission
    ? `🎨 Nouvelle demande de commission — ${clientName}`
    : `📅 Nouveau RDV — ${clientName} avec ${directeur}`;

  const teamBody = isCommission ? `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body { font-family: 'DM Sans', Arial, sans-serif; background: #0D0D0D; color: #F5F0E8; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background: #1A1A1A; }
  .header { background: #0D0D0D; padding: 2rem; text-align: center; border-bottom: 1px solid #C9A84C; }
  .logo { font-family: Georgia, serif; font-size: 1.8rem; color: #C9A84C; letter-spacing: 0.15em; }
  .logo span { color: #F5F0E8; }
  .badge { display: inline-block; background: #7B5EA7; color: #fff; padding: 0.3rem 1rem; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.5rem; }
  .section { padding: 1.5rem 2rem; border-bottom: 1px solid rgba(201,168,76,0.1); }
  .section-title { font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A84C; margin-bottom: 1rem; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 0.6rem; font-size: 0.85rem; }
  .info-label { color: #9A9A8A; }
  .info-val { color: #F5F0E8; font-weight: 500; }
  .vision-box { background: #2C2C2C; padding: 1rem; border-left: 3px solid #C9A84C; margin-top: 0.5rem; font-size: 0.85rem; color: #F5F0E8; line-height: 1.7; }
  .footer { padding: 1.5rem 2rem; text-align: center; font-size: 0.72rem; color: #9A9A8A; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">KENZ<span> ZNICA</span></div>
    <div class="badge">Commission artistique — Najat Toubal</div>
  </div>
  <div class="section">
    <div class="section-title">Client</div>
    <div class="info-row"><span class="info-label">Nom</span><span class="info-val">${clientName}</span></div>
    <div class="info-row"><span class="info-label">Email</span><span class="info-val">${email}</span></div>
    ${tel ? `<div class="info-row"><span class="info-label">Téléphone</span><span class="info-val">${tel}</span></div>` : ''}
  </div>
  <div class="section">
    <div class="section-title">Demande</div>
    <div class="info-row"><span class="info-label">Type d'œuvre</span><span class="info-val">${type || '—'}</span></div>
    <div class="info-row"><span class="info-label">Format</span><span class="info-val">${format || '—'}</span></div>
    <div class="info-row"><span class="info-label">Budget</span><span class="info-val">${budget || '—'}</span></div>
    <div class="section-title" style="margin-top:1rem">Vision du client</div>
    <div class="vision-box">${vision || '—'}</div>
  </div>
  <div class="footer">KENZ ZNICA · Algérie & Maroc · kenzznica.com</div>
</div>
</body>
</html>` : `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body { font-family: 'DM Sans', Arial, sans-serif; background: #0D0D0D; color: #F5F0E8; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background: #1A1A1A; }
  .header { background: #0D0D0D; padding: 2rem; text-align: center; border-bottom: 2px solid #C9A84C; }
  .logo { font-family: Georgia, serif; font-size: 1.8rem; color: #C9A84C; letter-spacing: 0.15em; }
  .logo span { color: #F5F0E8; }
  .badge { display: inline-block; background: rgba(201,168,76,0.15); border: 1px solid #C9A84C; color: #C9A84C; padding: 0.3rem 1rem; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.5rem; }
  .rdv-box { margin: 1.5rem 2rem; background: #2C2C2C; padding: 1.5rem; border-left: 3px solid #C9A84C; }
  .rdv-date { font-family: Georgia, serif; font-size: 2rem; color: #C9A84C; font-weight: 300; }
  .rdv-time { font-size: 1.1rem; color: #F5F0E8; margin-top: 0.3rem; }
  .rdv-dir { font-size: 0.82rem; color: #9A9A8A; margin-top: 0.5rem; }
  .section { padding: 1.5rem 2rem; border-bottom: 1px solid rgba(201,168,76,0.1); }
  .section-title { font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A84C; margin-bottom: 1rem; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 0.6rem; font-size: 0.85rem; }
  .info-label { color: #9A9A8A; }
  .info-val { color: #F5F0E8; font-weight: 500; }
  .notes-box { background: #2C2C2C; padding: 1rem; border-left: 2px solid rgba(201,168,76,0.3); margin-top: 0.5rem; font-size: 0.82rem; color: #9A9A8A; line-height: 1.7; }
  .footer { padding: 1.5rem 2rem; text-align: center; font-size: 0.72rem; color: #9A9A8A; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">KENZ<span> ZNICA</span></div>
    <div class="badge">Nouveau rendez-vous</div>
  </div>
  <div class="rdv-box">
    <div class="rdv-date">${date}</div>
    <div class="rdv-time">à ${heure}</div>
    <div class="rdv-dir">avec ${directeur} — ${directeur_role}</div>
  </div>
  <div class="section">
    <div class="section-title">Client</div>
    <div class="info-row"><span class="info-label">Nom</span><span class="info-val">${clientName}</span></div>
    <div class="info-row"><span class="info-label">Email</span><span class="info-val">${email}</span></div>
    ${tel ? `<div class="info-row"><span class="info-label">Téléphone</span><span class="info-val">${tel}</span></div>` : ''}
    ${pays ? `<div class="info-row"><span class="info-label">Pays</span><span class="info-val">${pays === 'DZ' ? '🇩🇿 Algérie' : pays === 'MA' ? '🇲🇦 Maroc' : pays}</span></div>` : ''}
  </div>
  <div class="section">
    <div class="section-title">Détails</div>
    <div class="info-row"><span class="info-label">Sujet</span><span class="info-val">${sujet || '—'}</span></div>
    ${notes ? `<div class="notes-box">${notes}</div>` : ''}
  </div>
  <div class="footer">KENZ ZNICA · Algérie & Maroc · kenzznica.com</div>
</div>
</body>
</html>`;

  // ── EMAIL CLIENT ──
  const confirmMessages = {
    fr: { subject: `KENZ ZNICA — Confirmation ${isCommission ? 'de votre demande' : 'de votre rendez-vous'}` },
    ar: { subject: `KENZ ZNICA — تأكيد ${isCommission ? 'طلبك' : 'موعدك'}` },
    en: { subject: `KENZ ZNICA — ${isCommission ? 'Request' : 'Appointment'} confirmation` },
    es: { subject: `KENZ ZNICA — Confirmación de su ${isCommission ? 'solicitud' : 'cita'}` }
  };
  const clientSubject = (confirmMessages[lang] || confirmMessages.fr).subject;

  const clientBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background: #f8f5ef; color: #1A1A1A; margin: 0; padding: 0; }
  .container { max-width: 580px; margin: 0 auto; background: #ffffff; }
  .header { background: #0D0D0D; padding: 2rem; text-align: center; }
  .logo { font-family: Georgia, serif; font-size: 2rem; color: #C9A84C; letter-spacing: 0.15em; }
  .logo span { color: #F5F0E8; font-weight: 300; }
  .hero { padding: 2.5rem 2rem; text-align: center; border-bottom: 1px solid #f0ebe0; }
  .hero-icon { font-size: 2.5rem; margin-bottom: 1rem; }
  .hero-title { font-family: Georgia, serif; font-size: 1.6rem; font-weight: 300; color: #0D0D0D; margin-bottom: 0.5rem; }
  .hero-sub { font-size: 0.85rem; color: #9A9A8A; }
  .rdv-card { margin: 1.5rem 2rem; background: #faf6ee; border-left: 3px solid #C9A84C; padding: 1.5rem; }
  .rdv-date { font-family: Georgia, serif; font-size: 1.6rem; color: #C9A84C; font-weight: 300; }
  .rdv-dir { font-size: 0.82rem; color: #9A9A8A; margin-top: 0.4rem; }
  .body-text { padding: 1.5rem 2rem; font-size: 0.88rem; color: #555; line-height: 1.8; }
  .cta { display: block; margin: 1.5rem 2rem; background: #C9A84C; color: #0D0D0D; text-align: center; padding: 1rem; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; text-decoration: none; }
  .footer { background: #0D0D0D; padding: 1.5rem 2rem; text-align: center; font-size: 0.72rem; color: #9A9A8A; }
  .footer a { color: #C9A84C; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">KENZ<span> ZNICA</span></div>
  </div>
  <div class="hero">
    <div class="hero-icon">${isCommission ? '🎨' : '✓'}</div>
    <div class="hero-title">
      ${isCommission
        ? (lang === 'ar' ? 'تم استلام طلبك' : lang === 'en' ? 'Request received' : lang === 'es' ? 'Solicitud recibida' : 'Demande reçue')
        : (lang === 'ar' ? 'تم تأكيد موعدك' : lang === 'en' ? 'Appointment confirmed' : lang === 'es' ? 'Cita confirmada' : 'Rendez-vous confirmé')
      }
    </div>
    <div class="hero-sub">
      ${lang === 'ar' ? `مرحباً ${prenom}` : lang === 'en' ? `Hello ${prenom}` : lang === 'es' ? `Hola ${prenom}` : `Bonjour ${prenom}`}
    </div>
  </div>
  ${!isCommission ? `
  <div class="rdv-card">
    <div class="rdv-date">${date} à ${heure}</div>
    <div class="rdv-dir">${directeur} — ${directeur_role}</div>
  </div>` : ''}
  <div class="body-text">
    ${isCommission
      ? (lang === 'ar' ? `شكراً لاهتمامك بأعمال نجاة توبال. ستتواصل معك في غضون 48 ساعة لمناقشة مشروعك.`
        : lang === 'en' ? `Thank you for your interest in Najat Toubal's work. She will contact you within 48 hours to discuss your project.`
        : lang === 'es' ? `Gracias por su interés en las obras de Najat Toubal. Se pondrá en contacto con usted en 48 horas.`
        : `Merci pour votre intérêt pour les œuvres de Najat Toubal. Elle vous contactera dans les 48h pour échanger sur votre projet.`)
      : (lang === 'ar' ? `يسعدنا استقبالك. إذا احتجت إلى تعديل موعدك، يرجى التواصل معنا.`
        : lang === 'en' ? `We look forward to meeting you. If you need to reschedule, please don't hesitate to contact us.`
        : lang === 'es' ? `Esperamos verle pronto. Si necesita cambiar su cita, no dude en contactarnos.`
        : `Nous serons ravis de vous accueillir. Si vous souhaitez modifier ce rendez-vous, n'hésitez pas à nous contacter.`)
    }
  </div>
  <a href="https://kenzznica.com/agenda.html" class="cta">
    ${lang === 'ar' ? 'زيارة الموقع' : lang === 'en' ? 'Visit our website' : lang === 'es' ? 'Visitar el sitio' : 'Visiter notre site'}
  </a>
  <div class="footer">
    <strong style="color:#C9A84C">KENZ ZNICA</strong><br>
    Algérie & Maroc · <a href="mailto:contact@kenzznica.com">contact@kenzznica.com</a><br>
    <span style="margin-top:0.5rem;display:block">© 2025 KENZ ZNICA</span>
  </div>
</div>
</body>
</html>`;

  try {
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
      if (!r.ok) {
        const err = await r.text();
        console.error(`Email error to ${to}:`, err);
      }
      return r;
    };

    // Envoyer email équipe
    await sendEmail('fouedtaffar@outlook.com', teamSubject, teamBody);

    // Envoyer confirmation client si email valide
    await sendEmail('fouedtaffar@outlook.com', clientSubject, clientBody);
    }

    return res.status(200).json({ success: true, message: 'Emails envoyés' });

  } catch (error) {
    console.error('rdv.js error:', error);
    return res.status(500).json({ error: 'Erreur envoi email' });
  }
}
