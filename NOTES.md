# Expresse Driver – Notes du projet

## En ligne
- **Site :** https://hro6999.github.io/expresse-driver/
- **Dépôt GitHub :** https://github.com/hro6999/expresse-driver (public, compte `hro6999`)
- Publication : GitHub Pages, branche `main`. Chaque envoi sur GitHub met le site à jour en 1 à 2 minutes.

## Rôle de chaque fichier
| Fichier | Rôle |
|---|---|
| `index.html` | Le contenu et la structure de la page (sections, formulaire de réservation, balises pour Google). |
| `style.css` | L'apparence : couleurs noir et or, polices, animations, adaptation mobile / tablette / ordinateur. |
| `script.js` | Le fonctionnement : réglages modifiables (bloc CONFIG), réservation en 4 étapes, calendrier, cadran, compteurs, envoi par email. |
| `images/logo.svg` | Le logo (« E » doré), aussi utilisé comme icône d'onglet. |
| `images/vehicule-placeholder.svg` | Image provisoire du véhicule, à remplacer par une vraie photo. |
| `.nojekyll` | Petit fichier vide qui demande à GitHub de publier les fichiers tels quels. |
| `NOTES.md` | Ce fichier de notes. |

## Où modifier les infos
Tout se trouve dans le **bloc `CONFIG` en haut de `script.js`** :
email, lien WhatsApp, zone desservie, textes de l'accueil, chiffres clés,
photo et nom du véhicule, tarifs, avis clients, réglages de réservation
(nombre max de passagers et de bagages, pas des minutes, etc.).

Les mentions légales se modifient directement dans `index.html` (fenêtre « Mentions légales », vers la fin du fichier).

## À faire ensuite
- [ ] **Tester la réservation par email** : faire une réservation sur le site en ligne, puis cliquer sur le lien « Activate Form » reçu de FormSubmit sur expressedriver69@gmail.com (regarder aussi dans les spams). Refaire ensuite une réservation pour vérifier la réception et le message de confirmation.
- [ ] **Remplacer les avis provisoires** par de vrais avis clients (`CONFIG.avis` dans `script.js`).
- [ ] **Compléter les mentions légales** : nom, SIRET, numéro d'inscription au registre VTC, adresse (`index.html`).
- [ ] **Ajouter une FAQ** (questions fréquentes : délais de réservation, attente à l'aéroport, sièges enfant, annulation…).
- [ ] **Référencement Google** : inscrire le site sur Google Search Console, créer une fiche Google Business Profile « VTC Lyon ».
- [ ] **Mettre une vraie photo du véhicule** : la copier dans `images/` puis changer `CONFIG.photoVehicule`.
- [ ] **Numéro de téléphone** : à ajouter plus tard (il a été retiré volontairement du site).
