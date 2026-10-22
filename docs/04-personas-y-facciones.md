# Personas y facciones

Fase 3 de la ruta: "cada persona cuenta". Lo que hace que perder un corredor pese, y que la ciudad tenga voz.

## Corredores

Cada corredor tiene un **rasgo**, que fija sus tres atributos, y una **historia** de dos líneas: la primera describe el rasgo, la segunda su origen y, si lo tiene, su vínculo con otro corredor.

| Rasgo | Velocidad (celdas/s) | Carga (materiales) | Vista (radio) |
|---|---|---|---|
| Rápido | 2 | 2 | 1 |
| Fuerte | 1 | 5 | 1 |
| Buen ojo | 1 | 3 | 2 |
| Sin destacar | 1 | 3 | 1 |

- Los tres corredores iniciales tienen rasgos distintos: uno rápido, uno fuerte, uno de buen ojo. Los reclutas salen al azar entre los cuatro.
- El taller suma 1 de velocidad a todos.
- **Mejorar:** con 2 de conocimiento, un corredor en la ciudad sube un atributo (velocidad hasta 2, carga hasta 5, vista hasta 2).
- La recomendación de raciones y el tiempo restante se calculan con la velocidad de cada uno.

El generador tiene 30 nombres, 12 orígenes y 11 parentescos. El tercer corredor inicial siempre tiene un vínculo con uno de los otros dos; los demás, con probabilidad de dos tercios.

## Estados

| Estado | Qué pasa | Cómo se sale |
|---|---|---|
| En la ciudad | Espera órdenes. | Se envía. |
| Fuera | Camina hacia su destino y gasta una ración cada 6 s. | Vuelve a la ciudad, o se queda sin raciones. |
| Caído | Sin raciones, queda tirado donde estaba. Se mueve con las filas o columnas que giren. | Otro corredor que pase por su celda lo levanta. Si nadie llega en 60 s, muere. |
| Llevado | Va a cuestas de otro. Si quien lo lleva cae, cae también. | Al llegar a la ciudad queda herido. |
| Herido | Se recupera en la ciudad: 60 s, o 30 con enfermería. | Vuelve a la plaza. |
| De luto | Está en la ciudad pero no sale durante 60 s, porque murió alguien con quien tenía vínculo. | Pasa el tiempo. |
| Muerto, se fue | Definitivo. | |

Rescatar es una decisión: hay que mandar a otro corredor con raciones hasta donde cayó el primero, en un laberinto que puede girar en el camino.

## Facciones

En la ciudad hay quienes quieren salir y quienes quieren quedarse. Se representan con una balanza de −10 (quedarse) a +10 (salir), visible en la pestaña Ciudad.

| Acción | Movimiento |
|---|---|
| Enviar una expedición | +1 |
| Reclutar | +1 |
| Leer una marca | +1 |
| Rescatar a un caído (levantarlo) | +1 |
| Construir un huerto | −1 |
| Construir la enfermería | −1 |
| Muerte de un corredor | −2, y −1 más por cada vínculo vivo |

### Eventos de umbral

Cada uno se dispara una sola vez por partida y pausa el juego para contarlo.

| Umbral | Evento | Efecto |
|---|---|---|
| +5 | Impaciencia | Un corredor sano de la ciudad se va solo, con 3 raciones, hacia una celda sin explorar. Hay que decidir si se lo deja o se lo persigue. |
| +9 | Éxodo | Un corredor se va de la ciudad para siempre. |
| −5 | Miedo | La ciudad pierde 3 de comida: la esconden. |
| −9 | Encierro | Durante 30 s nadie puede salir de la ciudad. |

La balanza no es un sistema de diplomacia. Es un termómetro que convierte el estilo de juego en consecuencias: quien solo explora empuja hacia Impaciencia y Éxodo; quien solo construye, hacia Miedo y Encierro.

## Pendiente

- Que el luto y el rescate tengan más peso en la historia: frases propias de cada corredor al caer, al rescatar y al volver.
- Más eventos intermedios (a ±3) que den algo a cambio, no solo quiten.
- Pruebas con personas: ¿evitan mandar a un corredor concreto por quién es?
