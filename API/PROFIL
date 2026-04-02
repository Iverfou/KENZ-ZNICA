// api/profil.js — KENZ ZNICA
// Reçoit le profil client depuis profil.html
// 1. Sauvegarde dans Airtable (base KENZ ZNICA, table Clients)
// 2. Email de bienvenue personnalisé au client via Resend
// 3. Notification interne à l'équipe

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    prenom, nom, email, tel, pays,
    projets, proj_pays, ville, budget,
    surface, chambres, type_bien,
    delai, objectif, notes,
    newsletter, lang
  } = req.body;

  if (!prenom || !nom || !email) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const clientName = `${prenom} ${nom}`;
  const fromEmail = process.env.EMAIL_EXPEDITEUR || 'contact@kenzznica.com';
  const teamEmail = process.env.EMAIL_DESTINATAIRE;

  // ── 1. AIRTABLE ──
  try {
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Clients`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
        },
        body: JSON.stringify({
          fields: {
            'Nom complet': clientName,
            'Email': email,
            'Téléphone': tel || '',
            'Pays résidence': pays || '',
            'Types de projets': Array.isArray(projets) ? projets.join(', ') : '',
            'Pays projet': proj_pays || '',
            'Ville': ville || '',
            'Budget': budget || '',
            'Surface (m²)': surface ? parseInt(surface) : null,
            'Chambres': chambres || '',
            'Type de bien': type_bien || '',
            'Délai': delai || '',
            'Objectif': objectif || '',
            'Notes': notes || '',
            'Newsletter': newsletter ? true : false,
            'Langue': lang || 'fr',
            'Date inscription': new Date().toISOString().split('T')[0],
            'Source': 'profil.html'
          }
        })
      }
    );

    if (!airtableRes.ok) {
      const err = await airtableRes.text();
      console.error('Airtable error:', err);
      // On continue même si Airtable échoue
    } else {
      console.log('Profil sauvegardé dans Airtable');
    }
  } catch (err) {
    console.error('Airtable exception:', err);
  }

  // ── 2. EMAIL BIENVENUE CLIENT ──
  const welcomeSubjects = {
    fr: 'Bienvenue dans la famille KENZ ZNICA ✦',
    ar: 'مرحباً بك في عائلة KENZ ZNICA ✦',
    en: 'Welcome to the KENZ ZNICA family ✦',
    es: 'Bienvenido a la familia KENZ ZNICA ✦'
  };

  const welcomeIntros = {
    fr: `Bonjour ${prenom},<br><br>Votre profil a bien été reçu par notre équipe. Nous sommes ravis de vous accueillir dans la famille KENZ ZNICA.`,
    ar: `مرحباً ${prenom}،<br><br>تم استلام ملفك من قِبل فريقنا. يسعدنا الترحيب بك في عائلة KENZ ZNICA.`,
    en: `Hello ${prenom},<br><br>Your profile has been received by our team. We are delighted to welcome you to the KENZ ZNICA family.`,
    es: `Hola ${prenom},<br><br>Su perfil ha sido recibido por nuestro equipo. Nos alegra darle la bienvenida a la familia KENZ ZNICA.`
  };

  const projectTypes = {
    renovation: { fr: 'Rénovation', ar: 'تجديد', en: 'Renovation', es: 'Renovación' },
    achat: { fr: 'Achat immobilier', ar: 'شراء عقار', en: 'Property purchase', es: 'Compra inmobiliaria' },
    vente: { fr: 'Vente d\'un bien', ar: 'بيع عقار', en: 'Property sale', es: 'Venta de un bien' },
    decoration: { fr: 'Décoration artistique', ar: 'ديكور فني', en: 'Artistic decoration', es: 'Decoración artística' },
    investissement: { fr: 'Investissement', ar: 'استثمار', en: 'Investment', es: 'Inversión' },
    evenement: { fr: 'Événement culturel', ar: 'فعالية ثقافية', en: 'Cultural event', es: 'Evento cultural' }
  };

  const projetsList = Array.isArray(projets) && projets.length > 0
    ? projets.map(p => projectTypes[p]?.[lang] || p).join(' · ')
    : '—';

  const nextStepsLabels = {
    fr: 'Nos prochaines étapes',
    ar: 'الخطوات القادمة',
    en: 'Next steps',
    es: 'Próximos pasos'
  };

  const steps = {
    fr: ['Notre équipe analysera votre profil sous 24h.','Le directeur concerné vous contactera directement.', newsletter ? 'Vous recevrez bientôt notre newsletter personnalisée.' : 'Vous pouvez visiter nos réalisations et biens disponibles en ligne.'],
    ar: ['سيحلل فريقنا ملفك خلال 24 ساعة.','سيتواصل معك المدير المعني مباشرة.', newsletter ? 'ستتلقى قريباً نشرتنا الإخبارية المخصصة.' : 'يمكنك زيارة إنجازاتنا والعقارات المتاحة عبر الإنترنت.'],
    en: ['Our team will review your profile within 24 hours.','The relevant director will contact you directly.', newsletter ? 'You will soon receive our personalised newsletter.' : 'You can browse our portfolio and available properties online.'],
    es: ['Nuestro equipo revisará su perfil en 24 horas.','El director pertinente le contactará directamente.', newsletter ? 'Recibirá pronto nuestra newsletter personalizada.' : 'Puede consultar nuestras realizaciones y bienes disponibles en línea.']
  };

  const currentSteps = steps[lang] || steps.fr;

  const clientEmailHTML = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background: #f8f5ef; color: #1A1A1A; margin: 0; padding: 0; }
  .container { max-width: 580px; margin: 0 auto; background: #ffffff; }
  .header { background: #0D0D0D; padding: 2.5rem 2rem; text-align: center; }
  .logo { font-family: Georgia, serif; font-size: 2.2rem; color: #C9A84C; letter-spacing: 0.2em; }
  .logo span { color: #F5F0E8; font-weight: 300; }
  .tagline { font-size: 0.72rem; color: #9A9A8A; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.5rem; }
  .hero { padding: 2.5rem 2rem; text-align: center; border-bottom: 1px solid #f0ebe0; }
  .welcome-text { font-family: Georgia, serif; font-size: 1.6rem; font-weight: 300; color: #0D0D0D; line-height: 1.3; margin-bottom: 0.5rem; }
  .welcome-text em { color: #C9A84C; font-style: italic; }
  .intro { padding: 1.5rem 2rem; font-size: 0.88rem; color: #555; line-height: 1.8; }
  .profile-box { margin: 0 2rem 1.5rem; background: #faf6ee; border-left: 3px solid #C9A84C; padding: 1.5rem; }
  .profile-title { font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A84C; margin-bottom: 1rem; }
  .profile-row { display: flex; justify-content: space-between; margin-bottom: 0.6rem; font-size: 0.82rem; border-bottom: 0.5px solid #f0ebe0; padding-bottom: 0.5rem; }
  .profile-label { color: #9A9A8A; }
  .profile-val { color: #1A1A1A; font-weight: 500; }
  .steps-box { margin: 0 2rem 1.5rem; }
  .steps-title { font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A84C; margin-bottom: 1rem; }
  .step-item { display: flex; align-items: flex-start; gap: 0.8rem; margin-bottom: 0.8rem; font-size: 0.82rem; color: #555; }
  .step-num { width: 22px; height: 22px; background: #C9A84C; color: #0D0D0D; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; flex-shrink: 0; }
  .cta-area { padding: 0 2rem 1.5rem; display: flex; gap: 1rem; }
  .cta { flex: 1; display: block; background: #C9A84C; color: #0D0D0D; text-align: center; padding: 0.9rem; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; text-decoration: none; }
  .cta-outline { flex: 1; display: block; background: none; border: 1px solid #C9A84C; color: #C9A84C; text-align: center; padding: 0.9rem; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; }
  .footer { background: #0D0D0D; padding: 1.5rem 2rem; text-align: center; }
  .footer-logo { font-family: Georgia, serif; font-size: 1.2rem; color: #C9A84C; letter-spacing: 0.15em; }
  .footer-info { font-size: 0.68rem; color: #9A9A8A; margin-top: 0.5rem; line-height: 1.8; }
  .footer-info a { color: #C9A84C; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">KENZ<span> ZNICA</span></div>
    <div class="tagline">Rénovation · Art · Immobilier · Algérie & Maroc</div>
  </div>

  <div class="hero">
    <div class="welcome-text">
      ${lang === 'ar' ? `مرحباً بك في عائلة <em>KENZ ZNICA</em>` : lang === 'en' ? `Welcome to the <em>KENZ ZNICA</em> family` : lang === 'es' ? `Bienvenido a la familia <em>KENZ ZNICA</em>` : `Bienvenue dans la famille <em>KENZ ZNICA</em>`}
    </div>
  </div>

  <div class="intro">${welcomeIntros[lang] || welcomeIntros.fr}</div>

  <div class="profile-box">
    <div class="profile-title">${lang === 'ar' ? 'ملفك' : lang === 'en' ? 'Your profile' : lang === 'es' ? 'Su perfil' : 'Votre profil'}</div>
    <div class="profile-row"><span class="profile-label">${lang === 'ar' ? 'الاسم' : lang === 'en' ? 'Name' : lang === 'es' ? 'Nombre' : 'Nom'}</span><span class="profile-val">${clientName}</span></div>
    ${ville ? `<div class="profile-row"><span class="profile-label">${lang === 'ar' ? 'المدينة' : lang === 'en' ? 'City' : lang === 'es' ? 'Ciudad' : 'Ville'}</span><span class="profile-val">${ville}</span></div>` : ''}
    <div class="profile-row"><span class="profile-label">${lang === 'ar' ? 'المشاريع' : lang === 'en' ? 'Projects' : lang === 'es' ? 'Proyectos' : 'Projets'}</span><span class="profile-val">${projetsList}</span></div>
    ${budget ? `<div class="profile-row"><span class="profile-label">${lang === 'ar' ? 'الميزانية' : lang === 'en' ? 'Budget' : lang === 'es' ? 'Presupuesto' : 'Budget'}</span><span class="profile-val">${budget}</span></div>` : ''}
    <div class="profile-row"><span class="profile-label">${lang === 'ar' ? 'النشرة الإخبارية' : lang === 'en' ? 'Newsletter' : lang === 'es' ? 'Newsletter' : 'Newsletter'}</span><span class="profile-val">${newsletter ? '✓' : '✗'}</span></div>
  </div>

  <div class="steps-box">
    <div class="steps-title">${nextStepsLabels[lang] || nextStepsLabels.fr}</div>
    ${currentSteps.map((s, i) => `<div class="step-item"><div class="step-num">${i+1}</div><span>${s}</span></div>`).join('')}
  </div>

  <div class="cta-area">
    <a href="https://kenzznica.com/realisations.html" class="cta">${lang === 'ar' ? 'الإنجازات' : lang === 'en' ? 'Portfolio' : lang === 'es' ? 'Realizaciones' : 'Nos réalisations'}</a>
    <a href="https://kenzznica.com/agenda.html" class="cta-outline">${lang === 'ar' ? 'حجز موعد' : lang === 'en' ? 'Book appointment' : lang === 'es' ? 'Reservar cita' : 'Prendre RDV'}</a>
  </div>

  <div class="footer">
    <div class="footer-logo">KENZ ZNICA</div>
    <div class="footer-info">
      Algérie & Maroc<br>
      <a href="mailto:contact@kenzznica.com">contact@kenzznica.com</a><br>
      <a href="https://kenzznica.com">kenzznica.com</a>
    </div>
  </div>
</div>
</body>
</html>`;

  // ── EMAIL NOTIF ÉQUIPE ──
  const teamSubject = `👤 Nouveau profil client — ${clientName}`;
  const teamHTML = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{font-family:Arial,sans-serif;background:#0D0D0D;color:#F5F0E8;} .box{max-width:500px;margin:0 auto;background:#1A1A1A;padding:2rem;} .title{font-family:Georgia,serif;font-size:1.4rem;color:#C9A84C;margin-bottom:1.5rem;} .row{margin-bottom:0.7rem;font-size:0.85rem;} .label{color:#9A9A8A;display:block;font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase;} .val{color:#F5F0E8;}</style>
</head><body><div class="box">
<div class="title">Nouveau profil — ${clientName}</div>
<div class="row"><span class="label">Email</span><span class="val">${email}</span></div>
${tel ? `<div class="row"><span class="label">Téléphone</span><span class="val">${tel}</span></div>` : ''}
<div class="row"><span class="label">Pays</span><span class="val">${pays || '—'} → Projet: ${proj_pays || '—'} / ${ville || '—'}</span></div>
<div class="row"><span class="label">Projets</span><span class="val">${projetsList}</span></div>
<div class="row"><span class="label">Budget</span><span class="val">${budget || '—'}</span></div>
<div class="row"><span class="label">Bien</span><span class="val">${type_bien || '—'} · ${surface || '—'}m² · ${chambres || '—'} ch.</span></div>
<div class="row"><span class="label">Délai</span><span class="val">${delai || '—'}</span></div>
<div class="row"><span class="label">Objectif</span><span class="val">${objectif || '—'}</span></div>
<div class="row"><span class="label">Newsletter</span><span class="val">${newsletter ? '✓ OUI' : '✗ NON'}</span></div>
<div class="row"><span class="label">Langue</span><span class="val">${lang || 'fr'}</span></div>
${notes ? `<div class="row"><span class="label">Notes</span><span class="val" style="white-space:pre-wrap">${notes}</span></div>` : ''}
</div></body></html>`;

  try {
    const sendEmail = async (to, subject, html) => {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({ from: `KENZ ZNICA <${fromEmail}>`, to: [to], subject, html })
      });
      if (!r.ok) console.error(`Email error to ${to}:`, await r.text());
    };

    // Email bienvenue client
    await sendEmail(email, welcomeSubjects[lang] || welcomeSubjects.fr, clientEmailHTML);
    // Notif équipe
    await sendEmail(teamEmail, teamSubject, teamHTML);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('profil.js error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
