# Gammes d'écriture cycle 3

Application pour les enseignants de CM1, CM2 et 6e : 50 activités d'écriture courtes, chacune en trois niveaux (étayé, standard, expert), à modifier, projeter au tableau et imprimer.

Les activités sont tirées du guide « L'écriture au cycle 3 » (collection *Les guides fondamentaux pour enseigner*, ministère de l'Éducation nationale), chapitres III et IV.

## Mettre le site en ligne (une seule fois)

1. Sur github.com, créez un dépôt **public**, par exemple `gammes-ecriture`, sans cocher « Add a README ».
2. Déposez tout le contenu de ce dossier : *uploading an existing file*, puis glissez les fichiers et dossiers, puis *Commit changes*.
3. Vérifiez que le dossier `.github` est bien arrivé. Les dossiers dont le nom commence par un point sont souvent masqués sur l'ordinateur : s'il manque, suivez « Si le dossier .github manque » plus bas.
4. Dans *Settings → Pages*, à la ligne *Source*, choisissez **GitHub Actions**.
5. Ouvrez l'onglet *Actions* : la publication « Publier le site » démarre (ou lancez-la avec *Run workflow*). Une coche verte indique que le site est en ligne.
6. L'adresse du site apparaît dans *Settings → Pages* : `https://VOTRE-NOM.github.io/gammes-ecriture/`.

## Mettre à jour le site

Toute modification enregistrée dans le dépôt (*Commit changes*) reconstruit et republie le site automatiquement, en une à deux minutes. L'adresse ne change pas.

Si une activité est mal formée, la publication s'arrête et le site reste dans son état précédent : l'onglet *Actions* affiche une croix rouge et le message indique l'activité en cause.

## Modifier ou ajouter une activité

Les activités sont dans le dossier `src`, un fichier par groupe de familles :

| Fichier | Familles |
|---|---|
| `1-geste.js` | Geste d'écriture |
| `2-formuler.js` | Formuler |
| `3-orthographe-reviser.js` | Orthographe et accords, Réviser |
| `4-planifier-ecrits-longs.js` | Planifier, Vers les écrits longs |

Sur GitHub, ouvrez le fichier, cliquez sur le crayon, modifiez le texte, puis *Commit changes*.

Chaque activité est un bloc entre accolades :

| Clé | Contenu |
|---|---|
| `id` | identifiant unique : minuscules, chiffres et tirets, sans accent |
| `f` | famille : `geste`, `formuler`, `ortho`, `reviser`, `planifier` ou `longs` |
| `g` | sous-groupe affiché dans le catalogue |
| `p`, `d`, `m`, `mat` | page du guide, durée, modalité, matériel |
| `t`, `o` | titre, objectif |
| `c` | consigne commune aux trois niveaux |
| `e` | étapes « Pour réussir » |
| `k` | critères « Je vérifie » |
| `r` | réponses attendues communes (côté enseignant) |
| `prof` | conseils de mise en œuvre |
| `n` | les trois niveaux, dans l'ordre : étayé, standard, expert |

Dans chaque niveau : `s` support de l'exercice (obligatoire), `c` consigne propre au niveau, `a` coup de pouce, `r` réponses attendues.

Règles d'écriture :

- les textes sont placés entre accents graves : `` `comme ceci` `` ;
- un retour à la ligne dans le texte donne un retour à la ligne à l'écran ;
- chaque bloc et chaque ligne se terminent par une virgule ;
- pour ajouter une activité, copiez un bloc existant et changez son `id`.

## Fichiers du dépôt

- `src/` : activités, programme (`app.js`), mise en forme (`style.css`), structure de la page (`body.html`).
- `build.py` : assemble le tout en un seul fichier `site/index.html`.
- `verifier.py` : contrôle les activités avant publication.
- `.github/workflows/publier.yml` : l'automatisation.

Pour assembler sur un ordinateur : `python build.py`. Le fichier `site/index.html` obtenu fonctionne seul, sans connexion : il peut être copié sur une clé USB.

## À savoir

- Les modifications qu'un enseignant fait dans l'application restent dans son navigateur. Une mise à jour du site ne les efface pas ; une fiche qu'il a modifiée garde sa version tant qu'il n'a pas cliqué sur « Rétablir le texte d'origine ».
- La création de supports par l'IA n'existe que dans la version publiée sur Claude, pas sur ce site.

## Si le dossier .github manque

Sur GitHub : *Add file → Create new file*. Dans le nom, tapez `.github/workflows/publier.yml`, collez le texte ci-dessous, puis *Commit changes*.

```yaml
name: Publier le site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  publier:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploiement.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Assembler l'application
        run: python build.py
      - name: Vérifier les activités
        run: python verifier.py
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site
      - name: Publier sur GitHub Pages
        id: deploiement
        uses: actions/deploy-pages@v4
```
