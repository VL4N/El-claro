"""Genera fase-0/tablero.html: los cinco estados del tablero, listos para imprimir.

Uso: python3 fase-0/herramientas/generar_tablero.py
"""
import os
from verificar import MAPA, desplazar

COLUMNAS = "ABCDEFGHI"
NOMBRES = {"C": "Ciudad", "S": "Salida", "M": "Escombros", "K": "Marca"}


def celda_html(ch):
    if ch == "#":
        return '<td class="pared"></td>'
    if ch == ".":
        return "<td></td>"
    return f'<td class="{NOMBRES[ch].lower()}">{ch}</td>'


def tablero_html(mapa, ciclo):
    filas = []
    filas.append("<tr><th></th>" + "".join(f"<th>{c}</th>" for c in COLUMNAS) + "</tr>")
    for i, fila in enumerate(mapa):
        par = ' class="par"' if (i + 1) % 2 == 0 else ""
        filas.append(f"<tr{par}><th>{i + 1}</th>" + "".join(celda_html(ch) for ch in fila) + "</tr>")
    a, b = ciclo * 3 + 1, ciclo * 3 + 3
    return f"""
<section class="estado">
  <h2>Estado {ciclo + 1} <span>turnos {a} a {b}</span></h2>
  <table>{''.join(filas)}</table>
</section>"""


def main():
    estados = "".join(tablero_html(desplazar(MAPA, c), c) for c in range(5))
    html = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>El Claro: tablero de la fase 0</title>
<style>
  :root {{ --tinta: #1c1a17; --papel: #fbf8f2; --pared: #2b2723; --ciudad: #d9a441; --salida: #5aa469; --escombros: #b8b0a2; --marca: #6f8fc9; --par: #f0eadf; }}
  * {{ box-sizing: border-box; }}
  body {{ margin: 0; padding: 16px; font-family: Georgia, "Times New Roman", serif; color: var(--tinta); background: var(--papel); }}
  header {{ margin-bottom: 12px; }}
  h1 {{ font-size: 22px; margin: 0 0 4px; }}
  header p {{ margin: 0; font-size: 13px; }}
  .leyenda {{ display: flex; flex-wrap: wrap; gap: 10px 18px; font-size: 12px; margin: 10px 0 14px; }}
  .leyenda span {{ display: inline-flex; align-items: center; gap: 6px; }}
  .leyenda i {{ display: inline-block; width: 16px; height: 16px; border: 1px solid var(--tinta); font-style: normal; font-size: 10px; text-align: center; line-height: 14px; font-weight: bold; }}
  .estados {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }}
  .estado h2 {{ font-size: 15px; margin: 0 0 6px; }}
  .estado h2 span {{ font-weight: normal; font-size: 12px; margin-left: 8px; }}
  table {{ border-collapse: collapse; }}
  th {{ font-size: 10px; font-weight: normal; width: 28px; height: 20px; }}
  tr th {{ width: 16px; }}
  td {{ width: 28px; height: 28px; border: 1px solid var(--tinta); text-align: center; font-weight: bold; font-size: 13px; background: #fff; }}
  tr.par td:not(.pared):not(.ciudad):not(.salida):not(.escombros):not(.marca) {{ background: var(--par); }}
  td.pared {{ background: var(--pared); }}
  td.ciudad {{ background: var(--ciudad); }}
  td.salida {{ background: var(--salida); color: #fff; }}
  td.escombros {{ background: var(--escombros); }}
  td.marca {{ background: var(--marca); color: #fff; }}
  .nota {{ font-size: 12px; margin-top: 16px; max-width: 70ch; }}
  @media print {{
    body {{ padding: 0; background: #fff; }}
    .estados {{ grid-template-columns: repeat(2, 1fr); }}
    .estado {{ break-inside: avoid; }}
  }}
</style>
</head>
<body>
<header>
  <h1>El Claro: tablero de la fase 0</h1>
  <p>Cada ciclo, las filas pares (sombreadas) se desplazan una celda a la derecha. Usa el estado que corresponda al turno actual.</p>
</header>
<div class="leyenda">
  <span><i style="background:var(--ciudad)">C</i> Ciudad (E5)</span>
  <span><i style="background:var(--salida);color:#fff">S</i> Salida (I1)</span>
  <span><i style="background:var(--escombros)">M</i> Escombros: dado, 1 a 3 → 1 material, 4 a 6 → 2</span>
  <span><i style="background:var(--marca);color:#fff">K</i> Marca: 1 conocimiento</span>
  <span><i style="background:var(--pared)"></i> Pared</span>
  <span><i style="background:var(--par)"></i> Fila par (se desplaza)</span>
</div>
<div class="estados">{estados}</div>
<p class="nota">Cuando cambies de estado, mueve una celda a la derecha las fichas que estén en filas pares (de la columna I pasan a la A) y vuelve a tachar los hallazgos ya agotados: en filas pares también se desplazan una celda a la derecha.</p>
</body>
</html>
"""
    destino = os.path.join(os.path.dirname(__file__), "..", "tablero.html")
    with open(destino, "w", encoding="utf-8") as f:
        f.write(html)
    print("escrito", os.path.normpath(destino))


if __name__ == "__main__":
    main()
