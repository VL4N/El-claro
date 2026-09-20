"""Verifica que el tablero de la fase 0 sea jugable a lo largo de los ciclos.

Regla de cambio: cada 3 turnos, las filas pares se desplazan una celda a la derecha.
Este script imprime, para cada estado del tablero, la distancia desde la ciudad
a la salida y a cada hallazgo. Sirve para ajustar el mapa a mano.
"""
from collections import deque

MAPA = [
    "M.#.#..#S",
    "...#.#..#",
    "#..M.#...",
    "..#..##K.",
    "K#..C..#M",
    ".#.##....",
    "#..K..M..",
    "#..#..#..",
    "M..#....M",
]


def desplazar(mapa, ciclo):
    filas = []
    for i, fila in enumerate(mapa):
        numero = i + 1
        if numero % 2 == 0:
            k = ciclo % len(fila)
            fila = fila[-k:] + fila[:-k] if k else fila
        filas.append(fila)
    return filas


def distancias(mapa):
    alto, ancho = len(mapa), len(mapa[0])
    origen = next((r, c) for r in range(alto) for c in range(ancho) if mapa[r][c] == "C")
    dist = {origen: 0}
    cola = deque([origen])
    while cola:
        r, c = cola.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < alto and 0 <= nc < ancho and mapa[nr][nc] != "#" and (nr, nc) not in dist:
                dist[(nr, nc)] = dist[(r, c)] + 1
                cola.append((nr, nc))
    return dist


def coord(r, c):
    return f"{'ABCDEFGHI'[c]}{r + 1}"


if __name__ == "__main__":
    for ciclo in range(5):
        mapa = desplazar(MAPA, ciclo)
        dist = distancias(mapa)
        turnos = f"turnos {ciclo * 3 + 1}-{ciclo * 3 + 3}"
        print(f"\n== Estado {ciclo + 1} ({turnos}) ==")
        for fila in mapa:
            print("   " + " ".join(fila))
        celdas = [(r, c) for r in range(9) for c in range(9) if mapa[r][c] in "SMK"]
        for r, c in celdas:
            d = dist.get((r, c))
            print(f"   {mapa[r][c]} en {coord(r, c)}: {'inalcanzable' if d is None else str(d) + ' pasos'}")
        print(f"   celdas alcanzables: {len(dist)} de {sum(9 - f.count('#') for f in mapa)}")
