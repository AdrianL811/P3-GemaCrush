# GemaCrush 💎

Proyecto de práctica de React Native, Expo y Expo Router, desarrollado **a partir del código de la Lección 15 / proyecto `test-2026-2`**. El proyecto inicial ya tenía cuatro filas de celdas, PanResponder, Animated, temporizador y navegación básica. Esta versión implementa las reglas reales del juego, puntuaciones y diseño visual.

## Requisitos

- Node.js **22.13 o superior** (requerimiento de Expo SDK 57) y npm.
- Visual Studio Code o similar.
- Expo Go instalado en un teléfono compatible con **Expo SDK 57**.
- Teléfono y computadora en la misma red Wi-Fi o usar túnel Expo.

## Cómo iniciar en Windows

Abre la carpeta que contiene `package.json` en Visual Studio Code y ejecuta en **Terminal > Nueva terminal**:

```powershell
npm install
npx expo start -c
```

1. Abre Expo Go en tu teléfono.
2. Escanea el código QR que aparezca en la terminal (en iPhone normalmente se escanea con la app Cámara).
3. Prueba Inicio → Jugar → Game Over → Jugar otra vez; desde Inicio abre Créditos.
4. Si el teléfono no detecta tu PC, comprueba que ambos estén en la misma Wi-Fi, sin VPN, o prueba `npx expo start --tunnel`.

> Si recibes un error de incompatibilidad con Expo Go, revisa tu versión de Expo Go y la SDK 57 que utiliza el proyecto. Consulta https://expo.dev/go para instalar la edición correspondiente.

## Reglas

- Tablero **4 × 4**. **90 segundos** para conseguir puntos.
- Desliza una ficha directamente **arriba, abajo, izquierda o derecha** sobre otra con el **mismo nivel**.
- Cuando fusionas dos fichas de nivel N, se convierten en una sola de nivel N+1 en la casilla de destino. Se repone la ficha de origen poco después.
- Los niveles van del **1** al **6**. El nivel 6 es el máximo.
- Puntos por fusión al alcanzar el nivel N: **10 × 2^(N−1)**; por ejemplo, alcanzar el nivel 2 vale **20 puntos** y llegar al nivel 3 vale **40 puntos**.
- Arrastres no adyacentes, diagonales, hacia una ficha diferente o hacia coronas de nivel 6 **no generan puntos**.
- Si se agotan las parejas disponibles, el tablero se mezcla automáticamente. También hay botón «Mezclar fichas» sin puntuación adicional.
- Al finalizar el tiempo o usar «Terminar partida», Expo Router abre **Game Over** y muestra puntos, fusiones y nivel máximo conseguido.

## Pantallas

| Archivo | Función |
| --- | --- |
| `src/app/index.tsx` | Presentación, explicación del juego e instrucciones. |
| `src/app/game.tsx` | Juego, temporizador, gestos, fichas animadas y puntuación. |
| `src/app/gameover.tsx` | Resultado y opción de volver a jugar. |
| `src/app/credits.tsx` | Créditos y tecnologías. |
| `src/app/_layout.tsx` | Navegación con Expo Router. |

## Estructura de la implementación

- `src/game/engine.ts`: reglas puras de creación, fusión, validación, reposición y mezclado. Independiente de la interfaz.
- `src/theme.ts`: paleta de colores, estilos globales y seis niveles de gemas.
- `src/components/ActionButton.tsx` y `Brand.tsx`: elementos visuales reutilizables.
- `assets/images/`: ícono y pantalla de inicio de GemaCrush.
- `tests/engine.test.mjs`: pruebas unitarias de las reglas del tablero.

### Gráficos

Las seis celdas utilizan emojis (💧 🔹 💠 💎 🌟 👑) y colores de fondo diferenciados. Cada ficha indica visualmente su nivel y también muestra «NV. N», de manera que no se depende exclusivamente del color. Los emojis vienen del sistema operativo y pueden variar un poco entre Android y iOS. El ícono de la app es un gráfico propio de cristal en tonos turquesa y azul marino.

### Animaciones y gestos

`PanResponder` reconoce el desplazamiento desde la ficha de origen hasta la casilla de destino; `Animated.ValueXY` mueve la ficha bajo el dedo y un resorte la regresa al soltarla. `Animated.spring` también resalta las fichas recién creadas y fusionadas. La comprobación de adyacencia y nivel se hace en `engine.ts`, no en la vista.

## Pruebas

Reglas básicas (Node 22+):

```powershell
npm run test:logic
```

Comprobación de TypeScript una vez instaladas las dependencias:

```powershell
npm run typecheck
```

Comprobar manualmente en **Expo Go**:

- Navegación entre las 4 pantallas.
- Drag entre fichas iguales y contiguas (suma puntos y sube nivel).
- Drag diagonal / ficha distinta / casilla propia (no suma puntos).
- Animación del movimiento, fusión y reposición de fichas.
- Mezclado voluntario y automático, si no quedan parejas.
- Temporizador, fin de la partida y transmisión de estadísticas.

**Pendiente de personalizar:** en `src/app/credits.tsx`, sustituye la frase «Integrantes: agregar aquí los nombres del equipo» por los integrantes reales.

**Nota:** este proyecto se entrega como código fuente, sin `node_modules`, y debe instalar dependencias y probarse en un teléfono real antes de la demostración. No incluye aún el PDF solicitado en la entrega.
