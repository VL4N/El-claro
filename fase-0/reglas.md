# Fase 0: prototipo de papel. Reglas en una página

**Qué se prueba:** si decidir "¿mando un corredor ahora o espero al próximo ciclo?" genera una duda real.
Todo lo demás es andamiaje.

## Componentes

- El tablero impreso (`tablero.html`): cinco estados del laberinto, uno por ciclo.
- 3 fichas para los corredores (monedas, botones, lo que sea).
- 1 dado de seis caras.
- La hoja de registro (`registro-de-partida.md`) y un lápiz.

## Tablero

- Cuadrícula de 9x9. Columnas A a I, filas 1 a 9. La ciudad está en **E5**. La salida está en **I1**.
- Celdas negras son pared. No se puede entrar.
- **M** es escombros (da materiales). **K** es una marca (da conocimiento). Cada una se usa una sola vez: al agotarla, táchala.

## Inicio

- Comida: **6**. Materiales: **0**. Conocimiento: **0**.
- Los 3 corredores empiezan en la ciudad.
- La partida dura **15 turnos**.

## Un turno, en orden

1. **Ciudad.** Suma la producción (2 comida, más 2 por cada huerto construido). Resta 2 comida de consumo. Si no puedes pagar el consumo, la partida termina en derrota. Luego puedes construir con los materiales que estén en la ciudad.
2. **Expediciones.** Por cada corredor:
   - Si está en la ciudad y quieres que salga, elige cuántas raciones lleva (de 1 a 4) y paga esa cantidad de comida.
   - Mueve hasta **2 celdas** en línea recta o con giros, nunca en diagonal ni a través de paredes. Puede moverse menos o quedarse quieto.
   - Al entrar en una **M**: tira el dado. 1 a 3 → toma 1 material. 4 a 6 → toma 2. Tacha la M.
   - Al entrar en una **K**: anota 1 conocimiento. Tacha la K.
   - Un corredor carga como máximo **3 materiales**. Al entrar en la ciudad los deposita. Las raciones que le sobren se pierden.
3. **Raciones.** Cada corredor fuera de la ciudad gasta 1 ración. Si queda en 0 fuera de la ciudad, está **perdido**: retira la ficha y lo que cargaba.
4. **Ciclo.** Al final de los turnos **3, 6, 9 y 12**, pasa al siguiente estado del tablero. Las filas pares (2, 4, 6, 8) se desplazan una celda a la derecha. Un corredor que esté en una fila par se mueve con ella: una celda a la derecha, y si estaba en la columna I pasa a la A. Los corredores en filas impares no se mueven.

## Construir (solo en la fase de ciudad)

| Edificio | Costo | Efecto |
|---|---|---|
| Huerto | 4 materiales | +2 comida por turno, desde el turno siguiente. |
| Taller | 5 materiales | Los corredores se mueven 3 celdas por turno. Solo uno. |

## Usar el conocimiento

- Gasta **2 conocimiento** para que un corredor atraviese **una** celda de pared este turno. La pared no cambia.
- El conocimiento que no gastes cuenta como puntos al final.

## Fin de la partida

- Al terminar el turno 15, o antes si te quedas sin comida (derrota) o sin corredores (derrota).
- **Puntos:** materiales en la ciudad + conocimiento sin gastar + **10** si algún corredor llegó a la salida.
- Los puntos sirven para comparar partidas, no para "ganar". Lo importante está en la hoja de registro.

## La pregunta de la fase

Después de cada partida, respondan con honestidad: **¿al menos una vez alguien dudó de verdad antes de mandar o no mandar a un corredor?**
Si la respuesta es no en la mayoría de las partidas, hay que ajustar los números (ver la sección de ajustes en la hoja de registro).
