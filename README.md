# KENZ ZNICA — Documentation projet

Agence de rénovation, vente immobilière et décoration artistique.
**Présence :** Algérie & Maroc

---

## Équipe de direction

| Nom | Rôle |
|-----|------|
| Fatma Zohra Toubal | Rénovation & Gestion |
| Najat Toubal | Décoration artistique & Événements culturels |
| Abdelnasser Toubal | Financement & Transactions immobilières |
| Wahil Toubal | Logistique |

---

## Structure des fichiers

```
kenzznica/
├── index.html          # Page principale + Chatbot IA
├── agenda.html         # Prise de RDV avec créneaux
├── realisations.html   # Galerie avant/après
├── vente.html          # Appartements clé en main
├── art.html            # Espace artistique Najat Toubal
├── profil.html         # Formulaire profil client
├── vercel.json         # Config routing & headers
├── README.md           # Ce fichier
└── api/
    ├── chat.js         # Chatbot Claude Vision
    ├── rdv.js          # Emails confirmation RDV
    ├── profil.js       # Airtable + email bienvenue
    └── newsletter.js   # Newsletter IA personnalisée
```

---

## Variables d'environnement Vercel (7)

À configurer dans le dashboard Vercel > Settings > Environment Variables :

```
ANTHROPIC_API_KEY     → Clé Claude (console.anthropic.com)
RESEND_API_KEY        → Clé Resend (resend.com)
EMAIL_DESTINATAIRE    → Email interne de l'équipe
EMAIL_EXPEDITEUR      → contact@kenzznica.com (domaine vérifié dans Resend)
AIRTABLE_API_KEY      → Token Airtable (pat...)
AIRTABLE_BASE_ID      → ID de la base (appXXXXXXXX)
NEWSLETTER_SECRET     → Mot de passe pour déclencher la newsletter
```

---

## Pages HTML — Fonctionnalités

### index.html
- Présentation de l'agence et des 3 services
- Équipe direction (4 cartes)
- Localisations DZ & MA (avec Jijel)
- **Chatbot IA** avec upload de photos (Claude Vision)
- 4 langues : FR / AR / EN / ES + RTL arabe

### agenda.html
- Calendrier semaine (lun–sam), créneaux 30 min, 9h–17h30
- **4 directeurs sélectionnables** dans la sidebar
- Créneaux disponibles/réservés/passés
- Modal de réservation → appel `/api/rdv` → 2 emails
- Stockage créneaux réservés en localStorage par directeur

### realisations.html
- 6 projets fictifs (DZ + MA)
- **Slider avant/après interactif** (souris + tactile)
- Filtres : Tous / Résidentiel / Commercial / Artistique / DZ / MA
- Modal détail avec travaux réalisés + stats

### vente.html
- 6 biens fictifs (disponible / réservé / vendu)
- **Prix timeline** : acquisition → travaux → prix de vente
- **Historique de valorisation** dans le modal
- Barre de progression valeur ajoutée
- Filtres + tri par prix / valeur ajoutée
- Bouton RDV → `agenda.html?dir=2` (Abdelnasser)

### art.html
- **Hero Najat Toubal** avec tableau SVG génératif
- Galerie masonry 8 œuvres (tableaux / installations / objets)
- Filtres galerie + modal détail œuvre
- **4 événements culturels** à venir (Alger, Oran, Casablanca)
- **Formulaire de commission** personnalisée → `/api/rdv`

### profil.html
- Layout 2 colonnes sticky
- **8 sections progressives** avec barre de progression
- Budget slider intelligent (DA/MAD selon pays)
- 6 types de projets en checkboxes
- Toggle newsletter élégant
- → `/api/profil` (Airtable + email bienvenue)

---

## APIs Serverless

### /api/chat.js
- Reçoit messages + images base64 (Claude Vision)
- Prompt système en 4 langues
- Oriente vers le bon directeur selon la demande
- `ANTHROPIC_API_KEY`

### /api/rdv.js
- Reçoit données RDV ou commission artistique
- Email HTML élégant → équipe
- Email confirmation → client
- `RESEND_API_KEY` + `EMAIL_DESTINATAIRE` + `EMAIL_EXPEDITEUR`

### /api/profil.js
- Sauvegarde profil → Airtable (table "Clients")
- Email de bienvenue personnalisé → client (4 langues)
- Notification → équipe
- `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID` + `RESEND_API_KEY`

### /api/newsletter.js
- Protégé par `NEWSLETTER_SECRET`
- Récupère clients opt-in depuis Airtable
- Claude rédige email personnalisé selon profil de chaque client
- Envoi via Resend + pause 300ms entre chaque
- `NEWSLETTER_SECRET` + `ANTHROPIC_API_KEY` + `AIRTABLE_API_KEY` + `RESEND_API_KEY`

---

## Airtable — Structure table "Clients"

| Champ | Type |
|-------|------|
| Nom complet | Text |
| Email | Email |
| Téléphone | Phone |
| Pays résidence | Text |
| Types de projets | Text |
| Pays projet | Text |
| Ville | Text |
| Budget | Text |
| Surface (m²) | Number |
| Chambres | Text |
| Type de bien | Text |
| Délai | Text |
| Objectif | Text |
| Notes | Long text |
| Newsletter | Checkbox |
| Langue | Text |
| Date inscription | Date |
| Source | Text |

---

## Déploiement Vercel

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Dans le dossier du projet
vercel

# 3. Configurer les variables d'environnement
vercel env add ANTHROPIC_API_KEY
vercel env add RESEND_API_KEY
# ... (toutes les 7 variables)

# 4. Redéployer
vercel --prod
```

---

## Déclencher la newsletter

```bash
curl -X POST https://votre-domaine.vercel.app/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"secret":"VOTRE_MOT_DE_PASSE","sujet":"Nouveaux biens disponibles - Printemps 2025"}'
```

---

## Langues supportées

- 🇫🇷 Français (défaut)
- 🇸🇦 Arabe (RTL automatique)
- 🇬🇧 Anglais
- 🇪🇸 Espagnol

---

*© 2025 KENZ ZNICA — Algérie & Maroc*
