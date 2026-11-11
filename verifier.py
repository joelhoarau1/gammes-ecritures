"""Contrôle rapide après assemblage : arrête la publication si une activité est mal formée.
Usage : python verifier.py   (après python build.py)"""
import pathlib, re, subprocess, sys, shutil

racine = pathlib.Path(__file__).parent
page = (racine / "site" / "index.html").read_text("utf-8")
scripts = re.findall(r"<script>\n(.*?)\n</script>", page, re.S)
if len(scripts) != 2:
    sys.exit("Erreur : la page assemblée ne contient pas ses deux blocs de script.")

controle = r"""
const src = require('fs').readFileSync(0, 'utf8');
const { FAMILLES, ACTIVITES } = new Function(src + ';return {FAMILLES, ACTIVITES};')();
const fam = new Set(FAMILLES.map(f => f.id)), ids = new Set(), pb = [];
for (const a of ACTIVITES) {
  const ou = 'Activité « ' + (a.id || a.t || '?') + ' » : ';
  if (!/^[a-z0-9-]+$/.test(a.id || '')) pb.push(ou + 'identifiant invalide (minuscules, chiffres, tirets)');
  if (ids.has(a.id)) pb.push(ou + 'identifiant utilisé deux fois'); ids.add(a.id);
  if (!fam.has(a.f)) pb.push(ou + 'famille inconnue « ' + a.f + ' »');
  for (const k of ['t', 'o', 'c', 'g', 'd', 'm']) if (!a[k]) pb.push(ou + 'champ « ' + k + ' » manquant');
  if (!Array.isArray(a.e) || !a.e.length) pb.push(ou + 'étapes « e » manquantes');
  if (!Array.isArray(a.k) || !a.k.length) pb.push(ou + 'critères « k » manquants');
  if (!Array.isArray(a.n) || a.n.length !== 3) pb.push(ou + 'il faut exactement 3 niveaux dans « n »');
  else a.n.forEach((l, i) => { if (!l.s) pb.push(ou + 'support « s » manquant au niveau ' + (i + 1)); });
}
if (pb.length) { console.error(pb.join('\n')); process.exit(1); }
console.log(ACTIVITES.length + ' activités vérifiées, aucune anomalie.');
"""
if not shutil.which("node"):
    print("Node.js absent : vérification ignorée."); sys.exit(0)
r = subprocess.run(["node", "-e", controle], input=scripts[0], text=True, capture_output=True)
print((r.stdout + r.stderr).strip())
sys.exit(r.returncode)
