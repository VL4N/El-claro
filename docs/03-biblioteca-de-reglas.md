# Biblioteca de reglas del laberinto

Cada partida elige **un patrón** de esta biblioteca, según la semilla y el nivel de dificultad. El jugador no sabe cuál hasta el final. Lo descubre observando qué cambia en cada giro y confirmando líneas en la sala de mapas.

## Cómo está armado un patrón

Un patrón es una lista de **líneas**: filas o columnas que se desplazan una celda en cada giro, con un sentido y un ritmo.

- **Filas** se desplazan a la derecha o a la izquierda. **Columnas**, hacia abajo o hacia arriba. Lo que sale por un borde entra por el otro.
- Las filas 7, 8 y 9 y las columnas G, H e I nunca se mueven: ahí está la ciudad.
- **Ritmos:** *fijo* (en todos los giros), *alterna* (un giro hacia un lado, el siguiente hacia el otro) y *cada dos* (solo en los giros pares).
- Los corredores y los hallazgos que estén en una línea móvil se mueven con ella.

El motor aplica las líneas en orden, filas primero. La función que desplaza el mapa es pura: recibe el mapa, el patrón y el número de giro, y devuelve el mapa nuevo. Eso permite verificar antes de empezar que la salida sea alcanzable y la ciudad nunca quede aislada, para cualquier patrón.

## Los doce patrones

Las filas y columnas están en la numeración que ve el jugador (filas 1 a 15, columnas A a O). "Pares" son las filas 2, 4, 6, 10, 12 y 14.

| Nº | Nombre | Dificultad | Qué hace |
|---|---|---|---|
| 1 | Norte y sur | 1 | Filas pares del norte (2, 4, 6) a la derecha; del sur (10, 12, 14) a la izquierda. |
| 2 | Corriente | 1 | Todas las filas pares a la derecha. |
| 3 | Espejo | 1 | Como norte y sur, pero al revés. |
| 4 | Anillos | 2 | Filas pares alternando sentido según su distancia a la ciudad: 2 →, 4 ←, 6 →, 10 →, 12 ←, 14 →. |
| 5 | Cascada | 2 | Columnas en vez de filas: B, D, F hacia abajo; J, L, N hacia arriba. |
| 6 | Cruz | 2 | Solo cuatro líneas: filas 4 y 12 a la derecha, columnas D y L hacia abajo. |
| 7 | Marea | 3 | Como norte y sur, pero cada línea va y vuelve: un giro hacia un lado, el siguiente hacia el otro. Cada dos giros el mapa vuelve a ser el mismo. |
| 8 | Lento | 3 | Filas 2 y 6 a la derecha, 10 y 14 a la izquierda, pero solo en los giros pares. En los impares no pasa nada. |
| 9 | Borde | 3 | El borde gira como una rueda: fila 1 →, columna O ↓, fila 15 ←, columna A ↑. |
| 10 | Mixto | 4 | Filas 2 y 4 a la derecha, fijas. Columnas L y N hacia arriba, pero van y vuelven. |
| 11 | Respiración | 4 | Las filas pegadas a la ciudad (6 y 10) van y vuelven; las lejanas (2 y 14) solo cada dos giros. |
| 12 | Remolino | 5 | Filas 3 y 13 van y vuelven en sentidos opuestos; columnas C y M fijas en sentidos opuestos; filas 6 y 10 solo cada dos giros. |

## Cómo se aprende un patrón en el juego

1. **Observar.** Tras cada giro, las celdas a la vista que cambiaron se marcan y el registro dice en qué filas. El mapa chico muestra cómo se conocía el laberinto antes del giro.
2. **Formular una hipótesis.** En la sala de mapas se arma una afirmación con un sujeto (un grupo de líneas, o una fila o columna suelta) y un predicado, y se gasta 1 conocimiento. El laberinto responde sí, no o en parte (con el conteo). Un sí sobre el sentido o el ritmo marca esas líneas en el borde del tablero para toda la partida.
3. **Pensar antes de preguntar.** El conocimiento viene de las marcas, seis por mapa, y también sirve para los atajos. Una hipótesis correcta sobre un grupo de seis filas vale por seis preguntas sueltas.

## Las marcas hablan

Cada marca leída revela una pista en palabras, en este orden:

1. La idea general del patrón, por ejemplo "aquí lo que se mueve son columnas, no filas".
2. En adelante, una línea que se mueve, sin decir hacia dónde: "la fila 4 se mueve". Si el ritmo es raro, lo avisa: "y no siempre hacia el mismo lado", "pero no en todos los giros".

Las pistas no reemplazan a la sala de mapas: dicen dónde mirar, y la sala confirma hacia dónde.

## Dificultad

En automático, las primeras partidas usan patrones de dificultad 1 y cada victoria sube un nivel, hasta 5. En el nivel 5 se mezclan los patrones de 4 y 5. El nivel nunca baja solo; se puede fijar a mano en la pestaña Ayuda. Al terminar la partida se revela el nombre y la dificultad del patrón.

## Sujetos y predicados de la sala de mapas

Sujetos: las filas pares del norte (2, 4, 6); del sur (10, 12, 14); todas las filas pares; las filas pegadas a la ciudad (6 y 10); las más lejanas (2 y 14); las columnas pares del oeste (B, D, F); del este (J, L, N); todas las columnas pares; el borde; las filas impares (3, 5, 11, 13); las columnas impares (C, E, K, M); o una fila o columna suelta.

Predicados: se mueven; no se mueven; van hacia la derecha (o abajo) en cada giro; van hacia la izquierda (o arriba) en cada giro; van y vuelven; se mueven solo en los giros pares.

## Pendiente para esta fase

- Pruebas con personas nuevas.
