# El Claro

Juego de estrategia por turnos. Administras una pequeña ciudad encerrada en el centro de un laberinto que cambia solo. Envías corredores a explorar, aprendes el patrón del laberinto y decides cuándo arriesgarlo todo para salir.

> Nombre provisional. "El Claro" es la ciudad; "El Muro" es el laberinto.

## Estado

Fase 1: prototipo mínimo jugable en el navegador, en `juego/`. La fase 0 (papel) quedó como opcional: el prototipo digital la reemplaza y la pregunta de la puerta se responde jugándolo.

**Jugar:** cuando GitHub Pages esté activado, el juego vive en `https://vl4n.github.io/El-claro/`. Mientras tanto, se puede abrir `juego/index.html` sirviendo la carpeta con cualquier servidor estático.

**Probar el motor:**

```
node juego/pruebas.mjs
```

El material de la fase está en [`fase-0/`](fase-0/):

- [`reglas.md`](fase-0/reglas.md): las reglas del prototipo en una página.
- [`tablero.html`](fase-0/tablero.html): los cinco estados del tablero, listos para imprimir. Ábrelo en el navegador e imprímelo.
- [`registro-de-partida.md`](fase-0/registro-de-partida.md): plantilla para anotar cada partida. La meta es juntar cinco.
- [`herramientas/`](fase-0/herramientas/): scripts para verificar que el tablero sea jugable y para regenerar el HTML.

## Documentos

- [docs/01-mapeo-del-juego.md](docs/01-mapeo-del-juego.md): concepto, pilares, sistemas y cómo se conectan entre sí.
- [docs/02-ruta-de-desarrollo.md](docs/02-ruta-de-desarrollo.md): fases, alcance de cada una, puertas de decisión y riesgos.

## Cómo seguir el avance

- **Fase actual y qué falta:** la issue abierta con etiqueta `seguimiento` de número más bajo, con su lista de entregables y sub-issues.
- **Qué se decidió y por qué:** [`BITACORA.md`](BITACORA.md), una entrada por sesión.
- **Diario corto:** la issue [Diario de desarrollo](../../issues/8), un comentario por sesión.
- **Hitos:** cada fase se cierra cerrando su issue con el resultado de la puerta de decisión escrito en ella. Las issues cerradas con etiqueta `seguimiento` son el historial de hitos.

## Pilares

1. El laberinto se aprende.
2. Cada persona cuenta.
3. Adentro y afuera se afectan.
4. La presión viene del reloj, no del enemigo.
