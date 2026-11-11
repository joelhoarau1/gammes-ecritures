/* Banque d'activités — d'après le guide « L'écriture au cycle 3 » (MEN), chapitres III et IV.
   Clés : g sous-groupe · p page du guide · d durée · m modalité · mat matériel · t titre · o objectif
   c consigne · e étapes pour réussir · k « je vérifie » · r réponses / notes enseignant · prof conseils
   n = 3 niveaux [étayé, standard, expert] : c consigne, s support, a coup de pouce, r réponses */
const FAMILLES = [
  { id: 'geste', t: `Geste d'écriture`, d: `Fluidité, vitesse et lisibilité du tracé` },
  { id: 'formuler', t: `Formuler`, d: `Choisir ses mots, ses phrases, ses connecteurs` },
  { id: 'ortho', t: `Orthographe et accords`, d: `Accorder, conjuguer, se relire en écrivant` },
  { id: 'reviser', t: `Réviser`, d: `Corriger, enrichir, réorganiser un texte` },
  { id: 'planifier', t: `Planifier`, d: `Organiser ses idées pendant et avant l'écriture` },
  { id: 'longs', t: `Vers les écrits longs`, d: `Stratégies, destinataire, projets d'écriture` },
];

const GRILLE_RECIT = `Pas du tout / En partie / Tout à fait

☐ ☐ ☐  Je propose une situation initiale qui respecte le cadre indiqué.
☐ ☐ ☐  Je nomme et décris les personnages.
☐ ☐ ☐  J'utilise le lexique appris.
☐ ☐ ☐  Je respecte l'orthographe des mots.
☐ ☐ ☐  J'applique les règles d'accord entre le sujet et le verbe.
☐ ☐ ☐  J'applique les règles d'accord dans le groupe nominal.
☐ ☐ ☐  J'emploie correctement l'imparfait.
☐ ☐ ☐  J'emploie correctement le passé simple.
☐ ☐ ☐  Je raconte une ou plusieurs scènes d'action qui créent des émotions chez mon lecteur : surprise, peur, suspense.
☐ ☐ ☐  Je structure mon texte en paragraphes qui correspondent à des étapes du récit.`;

const ACTIVITES = [
/* ───────────── GESTE D'ÉCRITURE ───────────── */
{ id: 'course-contre-la-montre', f: 'geste', g: `Vitesse et lisibilité`, p: 78, d: `10 min`, m: `Individuel`, mat: `Chronomètre (3 minutes), fiche d'amorces`,
  t: `La course contre la montre`,
  o: `Écrire vite tout en restant lisible, pour que le geste devienne automatique.`,
  c: `Complète chaque début de phrase. Tu as 3 minutes : écris vite, mais on doit pouvoir te relire !`,
  e: [`Lis tous les débuts de phrase avant le départ du chronomètre.`, `Écris sans t'arrêter : ne gomme pas, ne repasse pas sur tes lettres.`, `Garde des lettres de même taille, bien posées sur la ligne.`, `À la fin, compte tes phrases terminées et entoure les mots difficiles à relire.`],
  k: [`Mes phrases sont terminées et elles ont du sens.`, `Un camarade peut relire chaque mot.`, `Mes lettres sont régulières du début à la fin.`],
  r: `Réponses libres. Faire comparer, d'un essai à l'autre, le nombre de phrases complètes et la lisibilité.`,
  prof: `Variante du guide : l'élève fait plusieurs essais, puis compare ses productions en ajustant sa vitesse et la régularité de ses lettres. Garder le critère orthographique : écrire vite, mais la bonne forme.`,
  n: [
   { c: `Complète 4 débuts de phrase en 3 minutes. Aide-toi des mots proposés.`, s: `Un jour, j'ai découvert…
Dans mon cartable, il y a…
Quand il pleut, j'aime…
Mon animal préféré est…`, a: `Mots pour t'aider : un trésor, une clé, des crayons, un livre, lire, dessiner, le dauphin, le guépard.` },
   { s: `Un jour, j'ai découvert…
Ce matin, en arrivant à l'école,…
Si j'avais des ailes,…
Le plus beau souvenir de mes vacances, c'est…
Soudain, la porte s'ouvrit et…
Quand je serai grand(e),…` },
   { c: `Complète les 6 débuts de phrase en 3 minutes. Recommence ensuite sur une nouvelle feuille : essaie de battre ton record sans perdre en lisibilité.`, s: `Bien que la nuit soit tombée,…
Au moment où le volcan se réveilla,…
Parce qu'il avait oublié sa promesse,…
Derrière la colline, les explorateurs aperçurent…
Dès que la cloche sonnera,…
Malgré la fatigue, l'équipe…` },
  ] },

{ id: 'course-chronometree', f: 'geste', g: `Vitesse et lisibilité`, p: 80, d: `15 min`, m: `Individuel`, mat: `Chronomètre`,
  t: `La course d'écriture chronométrée`,
  o: `Accélérer son écriture sans perdre en lisibilité.`,
  c: `Recopie le texte deux fois : d'abord à ta vitesse habituelle, puis plus vite, en 1 minute. Compare ensuite tes deux copies.`,
  e: [`Phase 1 : recopie le texte à ta vitesse normale, en soignant tes lettres.`, `Phase 2 : recopie-le plus vite, en restant lisible.`, `Phase 3 : compare les deux copies et entoure, dans la seconde, les lettres mal formées.`, `Choisis une lettre à améliorer et écris-la cinq fois.`],
  k: [`Mes deux copies sont complètes.`, `Ma copie rapide reste lisible.`, `J'ai repéré les lettres que je dois soigner.`],
  r: `Pas de corrigé : observer l'écart de lisibilité entre les deux copies et les lettres repérées par l'élève.`,
  prof: `Progression possible sur dix séances (guide, p. 127) : texte de 20 mots en 1 minute, puis 30 à 40 mots dans le même temps, puis phrases plus longues à la ponctuation complexe.`,
  n: [
   { c: `Recopie le texte deux fois : d'abord à ta vitesse habituelle, puis plus vite, en 1 minute 30. Compare ensuite tes deux copies.`, s: `Le renard sort de son terrier. Il regarde autour de lui. Puis il file vers la forêt.` },
   { s: `Le renard sort de son terrier à la tombée du jour. Il dresse les oreilles, renifle l'air frais et observe la clairière. Rassuré, il se faufile entre les fougères et disparaît dans la forêt.` },
   { s: `À la tombée du jour, le renard quitte prudemment son terrier ; il dresse les oreilles, renifle l'air frais et scrute la clairière. « Rien à craindre », semble-t-il penser. Alors, d'un bond souple, il se faufile entre les fougères, longe le ruisseau et disparaît, silencieux, dans l'épaisseur de la forêt.` },
  ] },

{ id: 'duel-ecriture', f: 'geste', g: `Vitesse et lisibilité`, p: 81, d: `15 min`, m: `En binôme`, mat: `Une liste de phrases par élève`,
  t: `Le duel d'écriture`,
  o: `Écrire vite et bien : ce que j'écris doit pouvoir être lu par quelqu'un d'autre.`,
  c: `En duel avec ton camarade, recopie les phrases le plus vite possible. Échangez ensuite vos feuilles : chaque mot illisible donne un point à l'adversaire.`,
  e: [`Au signal, recopie toutes les phrases, vite mais lisiblement.`, `Échange ta feuille avec celle de ton adversaire.`, `Lis son texte à voix haute : si tu ne peux pas lire un mot, tu marques un point.`, `Comptez les points, puis réécrivez correctement les mots illisibles.`],
  k: [`J'ai recopié toutes les phrases.`, `Mon adversaire a pu lire tous mes mots.`, `J'ai réécrit les mots qui posaient problème.`],
  r: `Un mot est jugé illisible s'il ne peut pas être reconnu hors contexte.`,
  prof: `Variante du guide : introduire une écriture manuscrite modèle, que les élèves doivent imiter au mieux.`,
  n: [
   { s: `1. Le soleil se lève sur la colline.
2. Mon frère joue du tambour.
3. La pluie tombe sur le toit.` },
   { s: `1. Les hirondelles reviennent au printemps.
2. Le boulanger prépare des baguettes croustillantes.
3. Un orage violent a éclaté pendant la nuit.
4. Nous avons observé des fourmis à la loupe.` },
   { s: `1. Le photographe attendait patiemment le rhinocéros.
2. L'archéologue a découvert une mosaïque extraordinaire.
3. Les chrysanthèmes fleurissent à l'automne.
4. Le pharmacien range soigneusement les médicaments.
5. Un magnifique arc-en-ciel traversait l'horizon.` },
  ] },

{ id: 'dictee-rapide', f: 'geste', g: `Écrire de mémoire`, p: 79, d: `15 min`, m: `Classe entière`, mat: `Chronomètre projeté (disponible dans le mode projection)`,
  t: `La dictée rapide`,
  o: `Écrire de mémoire, vite et lisiblement, en séparant bien les mots.`,
  c: `Écoute la phrase jusqu'au bout. Dès qu'elle est terminée, écris-la de mémoire le plus vite possible, en restant lisible. Note ensuite ton temps.`,
  e: [`Écoute sans écrire : répète la phrase dans ta tête.`, `Au signal, écris la phrase d'un seul élan.`, `Lève la tête, lis le chronomètre et note ton temps en secondes.`, `Après la série, compare tes temps et la lisibilité de tes phrases.`],
  k: [`Mes phrases sont complètes et les mots sont bien séparés.`, `Mon temps diminue d'une phrase à l'autre.`, `Ma dernière phrase est aussi lisible que la première.`],
  prof: `Lancer le chronomètre projeté, dicter la phrase à vitesse normale : les élèves écrivent dès la fin de la dictée, puis lisent leur temps. Les phrases à dicter figurent ci-dessus, côté enseignant : elles ne sont jamais projetées.`,
  n: [
   { s: `Phrase 1 : …… secondes
Phrase 2 : …… secondes
Phrase 3 : …… secondes
Phrase 4 : …… secondes

Mon meilleur temps : …… secondes`, r: `Phrases à dicter (6 à 8 mots)
1. Le chien court dans le grand jardin.
2. Ma sœur range ses livres sur l'étagère.
3. Nous mangeons une pomme à la récréation.
4. Le vent pousse les nuages vers la mer.` },
   { s: `Phrase 1 : …… secondes
Phrase 2 : …… secondes
Phrase 3 : …… secondes
Phrase 4 : …… secondes

Mon meilleur temps : …… secondes`, r: `Phrases à dicter (10 à 12 mots)
1. Ce matin, les élèves ont visité le musée de la ville.
2. Le jardinier arrose les tomates avant la tombée de la nuit.
3. Dans la forêt, un écureuil cache ses noisettes sous les feuilles.
4. Pendant l'orage, nous sommes restés à l'abri sous le préau.` },
   { s: `Phrase 1 : …… secondes
Phrase 2 : …… secondes
Phrase 3 : …… secondes
Phrase 4 : …… secondes

Mon meilleur temps : …… secondes
La phrase que j'ai le mieux écrite : n° ……`, r: `Phrases à dicter (13 à 16 mots, ponctuation interne)
1. Lorsque la cloche a sonné, tous les enfants se sont précipités vers la sortie.
2. Le vieux pêcheur, fatigué par sa journée, rangeait lentement ses filets sur le quai.
3. Comme la rivière débordait, les habitants du village ont construit une digue de sable.
4. Avant de partir en expédition, l'exploratrice vérifia sa boussole, ses cartes et ses provisions.` },
  ] },

{ id: 'dictee-en-cascade', f: 'geste', g: `Écrire de mémoire`, p: 81, d: `10 min`, m: `Classe entière`, mat: `Cahier ou ardoise`,
  t: `La dictée en cascade`,
  o: `Écrire de plus en plus vite une phrase qui s'allonge, en séparant bien les mots.`,
  c: `Écris le mot dicté. À chaque nouveau mot, recopie tout ce qui précède et ajoute-le. Continue jusqu'à la phrase complète.`,
  e: [`Écoute le mot et écris-le tout de suite.`, `Au mot suivant, passe à la ligne : recopie le début, puis ajoute le nouveau mot.`, `Laisse un espace net entre les mots.`, `À la fin, relis ta dernière ligne : la phrase doit être complète et ponctuée.`],
  k: [`Chaque ligne reprend la précédente sans oubli.`, `Mes mots sont bien séparés.`, `Ma dernière ligne est aussi lisible que la première.`],
  prof: `Variante du guide : commencer par des phrases simples, puis introduire des phrases plus longues et plus complexes. Les phrases à dicter mot à mot figurent côté enseignant.`,
  n: [
   { s: `Exemple
Le
Le chien
Le chien court

À toi : une ligne pour chaque mot ajouté.`, r: `Phrases à dicter mot à mot
– Le chien court dans le jardin.
– Ma tante prépare un bon gâteau.` },
   { s: `Exemple
Le
Le chien
Le chien court

À toi : une ligne pour chaque mot ajouté.`, r: `Phrases à dicter mot à mot
– Le petit chat gris dort sous la vieille table.
– Les enfants construisent une cabane au fond du jardin.` },
   { c: `Écris le mot dicté. À chaque nouveau mot, recopie tout ce qui précède et ajoute-le. Essaie de finir chaque ligne avant le mot suivant.`, s: `Exemple
Le
Le chien
Le chien court

À toi : une ligne pour chaque mot ajouté.`, r: `Phrases à dicter mot à mot, à un rythme soutenu
– Dès l'aube, les pêcheurs courageux quittent le port malgré la tempête.
– Quand la neige tombe, les marmottes se réfugient dans leur terrier profond.` },
  ] },

{ id: 'double-tache', f: 'geste', g: `Contrôle du geste`, p: 79, d: `15 min`, m: `Individuel`, mat: `Texte court à copier`,
  t: `L'écriture en double tâche`,
  o: `Copier sans y penser, pour garder son attention disponible pour l'orthographe et les idées.`,
  c: `Recopie le texte. En même temps, réalise la mission indiquée.`,
  e: [`Lis le texte en entier une première fois.`, `Lis la mission : tu la réaliseras pendant que tu copies.`, `Copie par groupes de mots, et non lettre par lettre.`, `Relis ta copie et vérifie que la mission est réussie.`],
  k: [`Ma copie est complète et sans erreur.`, `La mission est réussie.`, `Mon écriture reste lisible.`],
  prof: `Variante du guide : alterner vitesse et précision (recopier rapidement, puis lisiblement).`,
  n: [
   { c: `Recopie le texte. Mission : après chaque phrase, écris entre parenthèses le nombre de lettres « a » qu'elle contient.`, s: `Le chat dort sur le canapé. Sa patte bouge dans son sommeil. Il rêve sans doute d'une chasse dans le jardin.`, r: `Phrase 1 : 3 — phrase 2 : 3 — phrase 3 : 4.` },
   { c: `Recopie le texte. Mission : pendant que tu copies, transforme-le au passé, à l'imparfait.`, s: `Chaque matin, le boulanger ouvre sa boutique avant le lever du soleil. Il allume le four, pétrit la pâte et dispose les croissants dans la vitrine. Les premiers clients arrivent en souriant.`, r: `Chaque matin, le boulanger ouvrait sa boutique avant le lever du soleil. Il allumait le four, pétrissait la pâte et disposait les croissants dans la vitrine. Les premiers clients arrivaient en souriant.` },
   { c: `Recopie le texte. Mission : pendant que tu copies, mets-le à l'imparfait et remplace « le navigateur » par « les navigateurs ».`, s: `Le navigateur observe le ciel. Il hisse la grand-voile, vérifie les cordages et note sa position dans le journal de bord. Quand le vent se lève, il est prêt.`, r: `Les navigateurs observaient le ciel. Ils hissaient la grand-voile, vérifiaient les cordages et notaient leur position dans le journal de bord. Quand le vent se levait, ils étaient prêts.` },
  ] },

{ id: 'ligatures-invisibles', f: 'geste', g: `Contrôle du geste`, p: 80, d: `15 min`, m: `Individuel`, mat: `Papier blanc, crayon effaçable`,
  t: `Le jeu des ligatures invisibles`,
  o: `Enchaîner les lettres d'un geste continu, comme dans une écriture cursive fluide.`,
  c: `Écris le texte sans jamais lever ton crayon : toutes les lettres et tous les mots s'enchaînent. Efface ensuite les liaisons inutiles entre les mots.`,
  e: [`Prépare un crayon effaçable et une feuille blanche.`, `Écris tout le texte d'un seul trait, sans lever le crayon.`, `Reprends ton texte : efface les traits qui relient les mots entre eux.`, `Ajoute ce qui manque : barres des « t », points des « i », accents.`],
  k: [`Je n'ai pas levé mon crayon pendant l'écriture.`, `Après correction, les mots sont bien séparés.`, `Chaque lettre est bien formée : barres, points, accents.`],
  r: `Pas de réponse unique : observer la continuité du tracé, puis la qualité des lettres après correction.`,
  prof: `L'exercice travaille l'anticipation et la continuité du geste propre à la cursive. Il peut se pratiquer sur ardoise.`,
  n: [
   { c: `Écris chaque groupe de mots sans lever ton crayon. Efface ensuite les liaisons inutiles entre les mots.`, s: `la lune
une petite tulipe
mon ami lit vite` },
   { s: `La petite tortue traverse lentement le jardin. Elle s'arrête près d'une tulipe et attend la pluie.` },
   { c: `Écris la phrase sans jamais lever ton crayon, puis efface les liaisons inutiles. Recommence en te chronométrant : gagne en fluidité sans perdre en qualité.`, s: `Au petit matin, l'intrépide exploratrice quitta le campement, traversa la rivière tumultueuse et atteignit enfin le sommet de la montagne.` },
  ] },

{ id: 'mot-inverse', f: 'geste', g: `Contrôle du geste`, p: 82, d: `10 min`, m: `Individuel`, mat: `Cahier ligné`,
  t: `Le mot inversé`,
  o: `Anticiper son geste et contrôler le tracé de chaque lettre.`,
  c: `Écris la phrase en attachant bien les lettres. Sous chaque mot, réécris-le à l'envers (la dernière lettre en premier), toujours en attaché.`,
  e: [`Écris la phrase en cursive, sans lever le crayon à l'intérieur d'un mot.`, `Sous chaque mot, écris-le à l'envers, lettre après lettre : moteur → ruetom.`, `Garde les liaisons entre les lettres, même à l'envers.`, `Repasse sur tes mots et corrige les tracés imparfaits.`],
  k: [`Tous les mots sont écrits à l'endroit et à l'envers.`, `Aucune lettre n'est oubliée dans les mots inversés.`, `Mes lettres restent attachées et bien formées.`],
  prof: `L'écriture « en miroir » du mot sollicite une planification plus fine du geste. Accepter une vitesse lente : c'est le contrôle qui est visé.`,
  n: [
   { c: `Écris chaque mot en attaché. Juste en dessous, écris-le à l'envers.`, s: `lune · ami · moto · tapis`, r: `enul · ima · otom · sipat` },
   { s: `Le moteur ronronne dans le garage.`, r: `eL ruetom ennornor snad el egarag.` },
   { s: `Une incroyable caravane traverse lentement le désert brûlant.`, r: `enU elbayorcni enavarac esrevart tnemetnel el treséd tnalûrb.` },
  ] },
