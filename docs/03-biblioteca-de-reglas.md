# Biblioteca de reglas del laberinto

Cada partida elige **un patrón** de esta biblioteca, según la semilla. El jugador no sabe cuál. Lo descubre observando qué cambia en cada giro y confirmando líneas en la sala de mapas.

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
2. **Confirmar.** En la sala de mapas se elige una fila o columna y se gasta 1 conocimiento. El juego responde qué hace esa línea y lo marca en el borde del tablero para toda la partida.
3. **Elegir qué preguntar.** El conocimiento viene de las marcas, seis por mapa, y también sirve para los atajos. No alcanza para preguntar todo: conviene preguntar por las líneas que cruzan las rutas que importan.

## Pendiente para esta fase

- Historial de varios giros, no solo el último.
- Elegir la dificultad del patrón según la partida (hoy se elige al azar entre los doce).
- Marcas de generaciones anteriores que den una pista en palabras ("aquí lo que se mueve son columnas").
- Que la sala de mapas permita preguntar por hipótesis ("¿las filas pares van a la derecha?") y no solo por líneas.
