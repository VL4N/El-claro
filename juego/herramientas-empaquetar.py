"""Genera una versión del juego en un solo archivo HTML, con el motor incrustado.

Uso: python3 juego/herramientas-empaquetar.py [--sin-esqueleto]
Escribe juego/el-claro.html (o lo imprime a stdout con --salida -).
Con --sin-esqueleto omite doctype/html/head/body, para publicarlo en claude.ai.
"""
import re, sys, os
base = os.path.dirname(os.path.abspath(__file__))
motor = open(os.path.join(base, "motor.js"), encoding="utf-8").read()
html = open(os.path.join(base, "index.html"), encoding="utf-8").read()

nombres = re.findall(r"^export (?:const|function|let) (\w+)", motor, flags=re.M)
cuerpo = re.sub(r"^export ", "", motor, flags=re.M)
modulo = "const M = (() => {\n" + cuerpo + "\nreturn { " + ", ".join(nombres) + " };\n})();\n"
html = html.replace('import * as M from "./motor.js";', modulo)
html = html.replace('<script type="module">', "<script>")
# sin trabajador de servicio ni manifest: en un solo archivo no aplican
html = re.sub(r"// Aplicación instalable.*?\} catch \{\}\n", "", html, flags=re.S)
html = re.sub(r'<link rel="manifest"[^>]*>\n', "", html)

if "--sin-esqueleto" in sys.argv:
    head = re.search(r"<head>(.*?)</head>", html, flags=re.S).group(1)
    body = re.search(r"<body>(.*?)</body>", html, flags=re.S).group(1)
    head = re.sub(r'<meta charset="utf-8">\n|<meta name="viewport"[^>]*>\n', "", head)
    html = head.strip() + "\n" + body.strip() + "\n"

destino = os.path.join(base, "el-claro.html")
if "--salida" in sys.argv:
    destino = sys.argv[sys.argv.index("--salida") + 1]
open(destino, "w", encoding="utf-8").write(html)
print("escrito", destino, len(html), "bytes")
