# COBIT 5 en el proyecto "Adivina el número"

COBIT 5 es una guía de buenas prácticas para manejar bien la tecnología. Está pensada para
organizaciones grandes, así que aquí se aplica **a escala**, con las ideas que sirven para un
proyecto pequeño. Se usan **3 dominios** (el taller pide mínimo 2).

## Dominios y procesos aplicados

| Dominio | Proceso | Qué se hizo en el proyecto | Dónde se ve |
|---|---|---|---|
| **APO** Alinear, Planificar y Organizar | **APO12** Gestionar el riesgo | Se identificaron 3 riesgos, se les dio probabilidad e impacto y se atendió el más importante (R1) | Informe, punto 2 y punto 4. Validación en `game.js` (`validarEntrada`) |
| **BAI** Construir, Adquirir e Implementar | **BAI02** Gestionar la definición de requisitos | Se definieron 3 requisitos funcionales (RF1, RF2, RF3) a partir de lo que necesita el participante de la feria | Informe, punto 1 |
| **BAI** Construir, Adquirir e Implementar | **BAI03** Gestionar la identificación y construcción de soluciones | Se diseñaron los componentes y el flujo de datos, y se construyó el juego con las 5 funciones | Informe, punto 3. Archivos `game.js`, `app.js`, `index.html`, `style.css` |
| **MEA** Monitorizar, Evaluar y Valorar | **MEA01** Monitorizar y evaluar el rendimiento y la conformidad | Se definieron criterios de calidad con meta (CC1 y CC2) y se comprueban con pruebas automáticas | `test/game.test.js` (comando `node --test`) |

## Cómo se conectan los requisitos, las pruebas y los riesgos

```
Necesidad de la feria  ->  Requisitos (RF1, RF2, RF3)   [BAI02]
                                   |
                                   v
                    Juego construido (game.js, app.js)   [BAI03]
                                   |
              +--------------------+--------------------+
              v                                         v
   Riesgos y cómo se atienden [APO12]      Pruebas que lo comprueban [MEA01]
   (R1 se atiende con validación estricta)  (CC1 y CC2: 49 pruebas, 0 fallos)
```

## Qué mejoraría con más tiempo

- **APO12:** guardar el secreto en un servidor para eliminar el riesgo R2, y guardar la partida
  para atender el riesgo R3.
- **MEA01:** repetir las pruebas cada vez que se cambie algo (por ejemplo el rango o los intentos)
  y llevar un registro de los resultados.
