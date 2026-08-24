# Diagnostic de peau — Institut Morgane César

Ce dossier contient l'application complète, prête à être mise en ligne. Le code de ton diagnostic (`src/App.jsx`) est identique à ton artifact d'origine — rien n'a été modifié dans la logique, seulement "emballé" pour tourner comme un vrai site.

Une fois en ligne, les 3 boutons (email, téléchargement, copier) fonctionneront normalement, dans un vrai navigateur.

---

## Option recommandée : mise en ligne sans terminal (GitHub + Netlify)

Aucune commande à taper. Tout se fait dans le navigateur, gratuitement.

### 1. Créer un compte GitHub (si tu n'en as pas)
→ [github.com](https://github.com), "Sign up", gratuit.

### 2. Créer un nouveau dépôt (repository)
- Bouton vert "New" → nomme-le par exemple `diagnostic-peau`
- Laisse-le "Public" ou "Private", peu importe
- Clique "Create repository"
- Sur la page suivante, clique sur le lien "uploading an existing file"
- Glisse-dépose **tout le contenu de ce dossier** (pas le dossier lui-même, son contenu : `index.html`, `package.json`, `src/`, etc.)
- En bas, clique "Commit changes"

### 3. Créer un compte Netlify (si tu n'en as pas)
→ [netlify.com](https://www.netlify.com), "Sign up", tu peux te connecter directement avec ton compte GitHub.

### 4. Connecter le site
- Dans Netlify : "Add new site" → "Import an existing project"
- Choisis GitHub, autorise l'accès, sélectionne le dépôt `diagnostic-peau`
- Netlify détecte automatiquement les réglages, vérifie qu'ils affichent :
  - **Build command** : `npm run build`
  - **Publish directory** : `dist`
- Clique "Deploy site"

Après 1 à 2 minutes, Netlify te donne une adresse du type `nom-au-hasard.netlify.app`. Ouvre-la : ton diagnostic est en ligne, testable sur mobile et ordinateur.

### 5. Brancher ton propre sous-domaine (diagnostic.morganecesar.fr)
- Dans Netlify : "Domain settings" → "Add a domain" → tape `diagnostic.morganecesar.fr`
- Netlify t'indique un enregistrement DNS à ajouter (type CNAME, pointant vers ton site Netlify)
- Va dans ton espace **OVH** (là où tu gères déjà les DNS de morganecesar.fr) → zone DNS → ajoute l'enregistrement CNAME indiqué par Netlify
- Le temps de propagation est généralement de quelques minutes à quelques heures

Une fois actif, `diagnostic.morganecesar.fr` affichera directement ton outil.

---

## Intégrer le lien sur ton site Wix

Le plus simple et le plus fiable : un bouton sur ton site Wix qui ouvre `diagnostic.morganecesar.fr` dans un nouvel onglet — pas d'iframe à gérer, aucun souci d'affichage.

Dans l'éditeur Wix : ajoute un bouton, type de lien "Web Address", colle l'URL, coche "Ouvrir dans un nouvel onglet".

Si tu préfères l'intégrer directement dans la page (sans nouvel onglet), Wix propose un élément "Intégrer un site" (iframe) — à tester, certains thèmes Wix limitent la hauteur ou le style, donc le lien simple reste l'option la plus sûre.

---

## Utilisation en cabine (tablette/PC)

Ouvre simplement `diagnostic.morganecesar.fr` dans le navigateur de la tablette ou du PC. Tu peux aussi l'ajouter à l'écran d'accueil de la tablette pour un accès en un tap, comme une application.

## Installer l'outil comme une icône (PWA)

Une fois en ligne, l'outil peut s'installer comme une vraie icône d'application, sans passer par l'App Store ni Google Play — gratuit, immédiat, aucune validation à attendre.

**Sur iPhone/iPad (Safari)** : ouvrir le lien → bouton Partager → "Sur l'écran d'accueil"

**Sur Android (Chrome)** : ouvrir le lien → menu (⋮) → "Installer l'application" (ou "Ajouter à l'écran d'accueil")

**Sur PC (Chrome/Edge)** : une icône d'installation apparaît directement dans la barre d'adresse

Une fois installée, l'icône ouvre le diagnostic en plein écran, sans barre de navigateur — exactement comme une application classique. C'est la même chose pour toi en cabine et pour tes clientes chez elles.

---

## Si tu préfères qu'une personne technique s'en charge

Toutes les commandes classiques fonctionnent normalement :
```
npm install
npm run build
```
Le résultat se trouve dans le dossier `dist/`, qui peut être déposé directement sur [app.netlify.com/drop](https://app.netlify.com/drop) (glisser-déposer, sans même de compte).

---

## Bon à savoir

- Une fois en ligne sur Netlify (en https), les boutons "Copier" et "Télécharger" fonctionneront dans tous les navigateurs modernes, y compris sur mobile.
- Le bouton "Envoyer par email" ouvre l'application mail par défaut de la personne avec le message pré-rempli — cela dépend de son appareil, mais c'est le comportement standard d'un lien `mailto`, rien à corriger côté code.
- Netlify est gratuit pour ce niveau de trafic (site vitrine / outil interne).
