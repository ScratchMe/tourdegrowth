NB = " "
TPL = open("share/i-template.html").read()
fr = dict(lang="fr", bib="Le Tour", badge="Diagnostic AARRR — 3 min", eyebrow="Score growth global", next="Prochaine action",
  move="Prends la cohorte de nouveaux utilisateurs d'un mois et compte combien sont encore actifs trente jours plus tard.",
  tag1="Retention est là où cette croissance cale.", tag2=f"Et la tienne{NB}?")
en = dict(lang="en", bib="The Tour", badge="AARRR check-up — 3 min", eyebrow="Overall growth score", next="Next move",
  move="Take one month's cohort of new users and count how many are still active thirty days later.",
  tag1="Retention is where this growth stalls.", tag2="Where does yours?")
for d in (fr, en):
    out = TPL
    for k, v in d.items():
        out = out.replace("{{" + k + "}}", v)
    open(f"share/i-{d['lang']}.html", "w").write(out)
