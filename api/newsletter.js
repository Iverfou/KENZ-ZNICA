// api/newsletter.js — KENZ ZNICA
// Déclenché manuellement par mot de passe secret
// 1. Récupère tous les clients newsletter depuis Airtable
// 2. Pour chaque client, Claude rédige un email personnalisé selon son profil
// 3. Envoi via Resend
//
// Usage : POST /api/newsletter
// Body : { "secret": "VOTRE_MOT_DE_PASSE", "sujet": "Titre optionnel" }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { secret, sujet } = req.body;

  // ── Vérification mot de passe ──
  if (!secret || secret !== process.env.NEWSLETTER_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const fromEmail = process.env.EMAIL_EXPEDITEUR || 'contact@kenzznica.com';
  const results = { sent: 0, errors: 0, skipped: 0, clients: [] };

  try {
    // ── 1. RÉCUPÉRER LES CLIENTS NEWSLETTER DEPUIS AIRTABLE ──
    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Clients?filterByFormula={Newsletter}=1&maxRecords=100`;

    const airtableRes = await fetch(airtableUrl, {
      headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` }
    });

    if (!airtableRes.ok) {
      return res.status(500).json({ error: 'Erreur Airtable', detail: await airtableRes.text() });
    }

    const airtableData = await airtableRes.json();
    const clients = airtableData.records || [];

    if (clients.length === 0) {
      return res.status(200).json({ message: 'Aucun client newsletter trouvé', results });
    }

    // ── 2. POUR CHAQUE CLIENT — CLAUDE RÉDIGE + RESEND ENVOIE ──
    for (const record of clients) {
      const f = record.fields;
      const email = f['Email'];
      const prenom = f['Nom complet']?.split(' ')[0] || 'Client';
      const lang = f['Langue'] || 'fr';
      const projets = f['Types de projets'] || '';
      const budget = f['Budget'] || '';
      const ville = f['Ville'] || '';
      const pays_projet = f['Pays projet'] || '';
      const type_bien = f['Type de bien'] || '';
      const objectif = f['Objectif'] || '';

      if (!email) { results.skipped++; continue; }

      // Prompt Claude pour rédiger le contenu
      const promptTexte = {
        fr: `Tu es le rédacteur newsletter de KENZ ZNICA, agence de rénovation et décoration en Algérie et Maroc.

Rédige un email newsletter personnalisé et chaleureux pour ce client :
- Prénom : ${prenom}
- Projets d'intérêt : ${projets || 'rénovation'}
- Budget indicatif : ${budget || 'non précisé'}
- Ville / Région : ${ville || pays_projet || 'Algérie/Maroc'}
- Type de bien : ${type_bien || 'appartement'}
- Objectif : ${objectif || 'habiter'}
${sujet ? `- Thème de cette newsletter : ${sujet}` : ''}

Instructions :
1. Commence par "Bonjour ${prenom},"
2. Parle-lui de 2 ou 3 actualités KENZ ZNICA pertinentes pour son profil (biens disponibles, événements culturels, conseils rénovation)
3. Mentionne Najat Toubal et la décoration artistique de façon naturelle
4. Termine avec un appel à l'action vers agenda.html
5. Ton : élégant, chaleureux, expert. Pas de jargon commercial.
6. Longueur : 180-220 mots maximum
7. Réponds UNIQUEMENT avec le texte de l'email (pas de sujet, pas de balises HTML, juste le texte pur)`,

        ar: `أنت كاتب النشرة الإخبارية لـ KENZ ZNICA، وكالة تجديد وديكور في الجزائر والمغرب.

اكتب نشرة إخبارية شخصية ودافئة لهذا العميل:
- الاسم الأول: ${prenom}
- المشاريع المهتم بها: ${projets || 'تجديد'}
- الميزانية: ${budget || 'غير محددة'}
- المدينة/المنطقة: ${ville || pays_projet || 'الجزائر/المغرب'}
- نوع العقار: ${type_bien || 'شقة'}
- الهدف: ${objectif || 'السكن'}
${sujet ? `- موضوع هذه النشرة: ${sujet}` : ''}

التعليمات:
1. ابدأ بـ "مرحباً ${prenom}،"
2. تحدث عن 2-3 أخبار من KENZ ZNICA مناسبة لملفه
3. اذكر نجاة توبال والديكور الفني بشكل طبيعي
4. اختم بدعوة للتصرف نحو agenda.html
5. الأسلوب: راقٍ، دافئ، خبير. 180-220 كلمة كحد أقصى
6. أجب بالنص فقط دون أي تنسيق HTML`,

        en: `You are the newsletter writer for KENZ ZNICA, a renovation and decoration agency in Algeria and Morocco.

Write a personalised, warm newsletter email for this client:
- First name: ${prenom}
- Projects of interest: ${projets || 'renovation'}
- Indicative budget: ${budget || 'unspecified'}
- City/Region: ${ville || pays_projet || 'Algeria/Morocco'}
- Property type: ${type_bien || 'apartment'}
- Goal: ${objectif || 'live in it'}
${sujet ? `- Newsletter theme: ${sujet}` : ''}

Instructions:
1. Start with "Hello ${prenom},"
2. Mention 2-3 KENZ ZNICA news items relevant to their profile
3. Naturally mention Najat Toubal and artistic decoration
4. End with a call to action towards agenda.html
5. Tone: elegant, warm, expert. No sales jargon. 180-220 words max.
6. Reply ONLY with the plain text of the email body`,

        es: `Eres el redactor de newsletter de KENZ ZNICA, agencia de renovación y decoración en Argelia y Marruecos.

Redacta un email newsletter personalizado y cálido para este cliente:
- Nombre: ${prenom}
- Proyectos de interés: ${projets || 'renovación'}
- Presupuesto indicativo: ${budget || 'no especificado'}
- Ciudad/Región: ${ville || pays_projet || 'Argelia/Marruecos'}
- Tipo de bien: ${type_bien || 'apartamento'}
- Objetivo: ${objectif || 'habitar'}
${sujet ? `- Tema de esta newsletter: ${sujet}` : ''}

Instrucciones:
1. Empieza con "Hola ${prenom},"
2. Menciona 2-3 novedades de KENZ ZNICA relevantes para su perfil
3. Menciona naturalmente a Najat Toubal y la decoración artística
4. Termina con una llamada a la acción hacia agenda.html
5. Tono: elegante, cálido, experto. Sin jerga comercial. Máximo 180-220 palabras.
6. Responde SOLO con el texto plano del email`
      };

      let emailContent = '';
      try {
        // Appel Claude pour rédiger le contenu
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-opus-4-5',
            max_tokens: 600,
            messages: [{
              role: 'user',
              content: promptTexte[lang] || promptTexte.fr
            }]
          })
        });

        if (claudeRes.ok) {
          const claudeData = await claudeRes.json();
          emailContent = claudeData.content?.[0]?.text || '';
        }
      } catch (claudeErr) {
        console.error(`Claude error for ${email}:`, claudeErr);
        results.errors++;
        continue;
      }

      if (!emailContent) { results.skipped++; continue; }

      // Construire l'email HTML
      const emailSubject = sujet
        ? `KENZ ZNICA — ${sujet}`
        : (lang === 'ar' ? 'نشرة KENZ ZNICA الإخبارية ✦'
          : lang === 'en' ? 'KENZ ZNICA Newsletter ✦'
          : lang === 'es' ? 'Newsletter KENZ ZNICA ✦'
          : 'Newsletter KENZ ZNICA ✦');

      const emailHTML = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f8f5ef;color:#1A1A1A;margin:0;padding:0;}
  .container{max-width:560px;margin:0 auto;background:#fff;}
  .header{background:#0D0D0D;padding:2rem;text-align:center;}
  .logo{font-family:Georgia,serif;font-size:2rem;color:#C9A84C;letter-spacing:0.15em;}
  .logo span{color:#F5F0E8;font-weight:300;}
  .tagline{font-size:0.7rem;color:#9A9A8A;letter-spacing:0.1em;text-transform:uppercase;margin-top:0.4rem;}
  .body-content{padding:2.5rem 2rem;font-size:0.9rem;line-height:1.9;color:#333;white-space:pre-wrap;}
  .divider{height:1px;background:#f0ebe0;margin:0 2rem;}
  .cta-area{padding:1.5rem 2rem;text-align:center;}
  .cta{display:inline-block;background:#C9A84C;color:#0D0D0D;padding:0.9rem 2.5rem;font-size:0.78rem;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;text-decoration:none;}
  .cta-label{font-size:0.72rem;color:#9A9A8A;margin-top:0.8rem;}
  .footer{background:#0D0D0D;padding:1.5rem 2rem;text-align:center;}
  .footer-logo{font-family:Georgia,serif;font-size:1.1rem;color:#C9A84C;letter-spacing:0.12em;}
  .footer-info{font-size:0.68rem;color:#9A9A8A;margin-top:0.5rem;line-height:1.9;}
  .footer-info a{color:#C9A84C;text-decoration:none;}
  .unsubscribe{font-size:0.65rem;color:#666;margin-top:0.5rem;}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">KENZ<span> ZNICA</span></div>
    <div class="tagline">Rénovation · Art · Immobilier · Algérie & Maroc</div>
  </div>
  <div class="body-content">${emailContent}</div>
  <div class="divider"></div>
  <div class="cta-area">
    <a href="https://kenzznica.com/agenda.html" class="cta">
      ${lang === 'ar' ? 'احجز موعدك' : lang === 'en' ? 'Book your appointment' : lang === 'es' ? 'Reservar su cita' : 'Prendre rendez-vous'}
    </a>
    <div class="cta-label">kenzznica.com</div>
  </div>
  <div class="footer">
    <div class="footer-logo">KENZ ZNICA</div>
    <div class="footer-info">
      Algérie & Maroc<br>
      <a href="mailto:contact@kenzznica.com">contact@kenzznica.com</a> ·
      <a href="https://kenzznica.com">kenzznica.com</a>
    </div>
    <div class="unsubscribe">${lang === 'ar' ? 'لإلغاء الاشتراك' : lang === 'en' ? 'To unsubscribe' : lang === 'es' ? 'Para cancelar' : 'Pour vous désabonner'} : <a href="mailto:contact@kenzznica.com?subject=unsubscribe" style="color:#9A9A8A">contact@kenzznica.com</a></div>
  </div>
</div>
</body>
</html>`;

      // Envoyer via Resend
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: `KENZ ZNICA <${fromEmail}>`,
            to: [email],
            subject: emailSubject,
            html: emailHTML
          })
        });

        if (resendRes.ok) {
          results.sent++;
          results.clients.push({ email, status: 'sent', lang });
        } else {
          results.errors++;
          results.clients.push({ email, status: 'error', lang });
        }
      } catch (resendErr) {
        console.error(`Resend error for ${email}:`, resendErr);
        results.errors++;
      }

      // Pause de 300ms entre chaque envoi pour éviter les rate limits
      await new Promise(r => setTimeout(r, 300));
    }

    return res.status(200).json({
      success: true,
      total: clients.length,
      ...results
    });

  } catch (error) {
    console.error('newsletter.js error:', error);
    return res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
}
