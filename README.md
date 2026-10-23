# Adivina el número

Mini‑proyecto del caso 11 de la actividad individual de Calidad de Software (SENA, ADSO 35).
**Aprendiz:** Carlos Perea

## ¿Qué es?

Un juego web: la computadora escoge un número secreto entre 1 y 100 y el participante tiene
10 intentos para adivinarlo. Después de cada intento el juego dice si el secreto es **mayor** o **menor**.

Se pensó para una feria, donde las reglas deben ser claras e iguales para todos.

## Regla principal (pregunta del caso)

**¿Las entradas inválidas y repetidas consumen intento? No.**

| Lo que escribe el usuario | ¿Gasta intento? |
|---|---|
| Nada, letras, decimales, signos o un número fuera de 1 a 100 | No |
| Un número que ya había probado | No |
| Un número entero nuevo entre 1 y 100 | **Sí** |

## Cómo usarlo

1. Abre el archivo `index.html` con doble clic (se abre en el navegador).
2. Escribe un número y pulsa **Probar**.
3. Pulsa **Nueva partida** para jugar otra vez.

No necesita instalar nada ni conexión a internet.

## Cómo ejecutar las pruebas

Se necesita tener Node.js instalado. En una terminal, dentro de esta carpeta, escribe:

```
node --test
```

Debe mostrar `pass 49` y `fail 0`.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html`, `style.css` | La pantalla del juego |
| `app.js` | Recibe lo que escribe el usuario y actualiza la pantalla |
| `game.js` | Las reglas del juego (las 5 funciones del informe) |
| `test/game.test.js` | Las pruebas automáticas |
| `COBIT5.md` | Cómo se aplicó COBIT 5 en el proyecto |

## Las 5 funciones (están en `game.js`)

1. `generarNumeroSecreto`: escoge el número secreto al azar.
2. `validarEntrada`: revisa si lo que escribió el usuario sirve como intento.
3. `compararConSecreto`: dice si el intento es mayor, menor o igual al secreto.
4. `procesarIntento`: junta las anteriores y actualiza la partida.
5. `reiniciarPartida`: empieza una partida nueva.

## Buenas prácticas aplicadas

- **Lógica separada de la pantalla.** `game.js` no toca la página; así se puede probar sola.
- **Nombres claros.** Las funciones y variables dicen lo que hacen.
- **Funciones pequeñas.** Cada una hace una sola cosa.
- **No se modifica el estado original.** Cada jugada devuelve una partida nueva; si el intento se rechaza, devuelve la misma, y por eso no se gasta intento.
- **Validación estricta.** Solo se aceptan dígitos (opción A del informe).
- **Número aleatorio parejo.** Se usa el generador aleatorio del navegador (`crypto`) y se descartan los valores que darían ventaja a unos números.
- **Seguridad básica.** Lo que escribe el usuario se muestra como texto, nunca como HTML; el número secreto no se escribe en la página.
- **Pruebas automáticas.** 49 pruebas ligadas a los criterios CC1 y CC2 y a los requisitos RF1, RF2 y RF3.
- **Pantalla sencilla de usar.** Etiqueta en el campo, mensajes que puede leer un lector de pantalla y diseño que se adapta al celular.

## Limitación conocida

El juego corre solo en el navegador, así que una persona con conocimientos técnicos podría
ver el número secreto con las herramientas del navegador. Para una feria con reglas claras es un
riesgo aceptado (riesgo R2 del informe). La solución real sería guardar el secreto en un servidor.
Tampoco se guarda la partida: si se recarga la página, empieza otra (riesgo R3).
