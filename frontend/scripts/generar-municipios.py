"""Genera src/lib/municipios-colombia.json desde la DIVIPOLA del DANE publicada en datos.gov.co.

Uso:
  curl -s 'https://www.datos.gov.co/resource/gdxc-w37w.json?$limit=2000' -o municipios.json
  python3 scripts/generar-municipios.py municipios.json src/lib/municipios-colombia.json

Los nombres llegan en mayusculas: se pasan a tipo titulo y algunos nombres oficiales largos se cambian por
el comun (Santiago de Cali -> Cali) para que coincidan con las ciudades del catalogo.
"""
import json, sys
d = json.load(open(sys.argv[1]))
MENORES = {'de','del','la','las','los','el','y','e','en'}
def titulo(t):
    t = t.strip()
    t = t.replace(', D.C.', ' D.C.')
    palabras = t.split(' ')
    out = []
    for i, p in enumerate(palabras):
        low = p.lower()
        if p in ('D.C.', '-'):
            out.append(p)
        elif i > 0 and low in MENORES:
            out.append(low)
        else:
            out.append(low[:1].upper() + low[1:])
    return ' '.join(out)
deps = {}
for x in d:
    dep = titulo(x['dpto']); mun = titulo(x['nom_mpio'])
    COMUN = {'Bogotá D.C.': 'Bogotá', 'Santiago de Cali': 'Cali', 'Cartagena de Indias': 'Cartagena',
             'San José de Cúcuta': 'Cúcuta', 'San Andrés de Tumaco': 'Tumaco', 'Guadalajara de Buga': 'Buga',
             'Santa Cruz de Mompox': 'Mompox', 'Villa de San Diego de Ubaté': 'Ubaté', 'Santiago de Tolú': 'Tolú'}
    mun = COMUN.get(mun, mun)
    if dep.startswith('Archipiélago'): dep = 'San Andrés, Providencia y Santa Catalina'
    deps.setdefault(dep, set()).add(mun)
import unicodedata
def clave(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')
res = [{'departamento': k, 'municipios': sorted(v, key=clave)} for k, v in sorted(deps.items(), key=lambda kv: clave(kv[0]))]
json.dump(res, open(sys.argv[2], 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(res), sum(len(r['municipios']) for r in res))
for r in res: print(r['departamento'], r['municipios'][:4])
