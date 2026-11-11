"""Assemble l'application en un seul fichier : site/index.html
Usage : python build.py"""
import pathlib

src = pathlib.Path(__file__).parent / "src"
lire = lambda nom: (src / nom).read_text("utf-8")

# Les quatre fichiers d'activités sont mis bout à bout, dans l'ordre de leur numéro.
activites = "".join(lire(f.name) for f in sorted(src.glob("[0-9]-*.js")))

# Bandeau de la page d'accueil : si src/bandeau.jpg (ou .jpeg, .png, .webp) existe, la photo est
# intégrée à la page ; sinon, l'application affiche son dessin de cahier par défaut.
import base64
bandeau = ""
for ext, mime in (("jpg", "jpeg"), ("jpeg", "jpeg"), ("png", "png"), ("webp", "webp")):
    f = src / f"bandeau.{ext}"
    if f.exists():
        octets = f.read_bytes()
        if len(octets) > 800_000:
            print(f"Attention : {f.name} pèse {len(octets) // 1024} Ko ; réduisez-la sous 500 Ko pour un chargement rapide.")
        bandeau = f'<script>window.BANDEAU="data:image/{mime};base64,{base64.b64encode(octets).decode()}";</script>\n'
        break

titre = "Gammes d’écriture cycle 3"
reset = (":root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}"
         "body{margin:0}img{max-width:100%}[hidden]{display:none!important}")
page = f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{titre}</title>
<style>{reset}</style>
</head>
<body>
<style>
{lire("style.css")}</style>
{lire("body.html")}
{bandeau}<script>
{activites}
</script>
<script>
{lire("app.js")}
</script>
</body>
</html>
"""
sortie = pathlib.Path(__file__).parent / "site"
sortie.mkdir(exist_ok=True)
(sortie / "index.html").write_text(page, "utf-8")
print(f"site/index.html : {len(page.encode('utf-8')) // 1024} Ko")
