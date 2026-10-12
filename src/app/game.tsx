
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '../components/Brand';
import { ActionButton } from '../components/ActionButton';
import { common, gems, palette } from '../theme';

import {
  Board,
  createInitialBoard,
  canMerge,
  formatTime,
  GAME_SECONDS,
  GRID_SIZE,
  insideBoard,
  merge,
  Position,
  refill,
  shuffleBoard,
  Tile,
} from '../game/engine';

const BOARD_PADDING = 9;
const BOARD_BORDER = 1;
const CELL_GAP = 7;
const SWIPE_MIN_DISTANCE = 14;

function samePosition(
  a: Position | null,
  b: Position | null
): boolean {
  return a?.row === b?.row && a?.col === b?.col;
}

type GemCellProps = {
  tile: Tile | null;
  size: number;
  picked: boolean;
  hovered: boolean;
  validTarget: boolean;
  dragOffset: Animated.ValueXY;
};

function GemCell({
  tile,
  size,
  picked,
  hovered,
  validTarget,
  dragOffset,
}: GemCellProps) {
  const pop = useRef(new Animated.Value(1)).current;
  const lastTileId = useRef(tile?.id);

  useEffect(() => {
    if (tile && tile.id !== lastTileId.current) {
      pop.setValue(0.68);

      Animated.spring(pop, {
        toValue: 1,
        speed: 16,
        bounciness: 12,
        useNativeDriver: false,
      }).start();
    }

    lastTileId.current = tile?.id;
  }, [tile?.id, tile, pop]);

  const description = tile
    ? gems[tile.level - 1]
    : null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.tileOuter,
        {
          width: size,
          height: size,
          zIndex: picked ? 10 : 1,
          elevation: picked ? 10 : 1,
        },
        {
          transform: [
            {
              translateX: picked ? dragOffset.x : 0,
            },
            {
              translateY: picked ? dragOffset.y : 0,
            },
            {
              scale: pop,
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.tile,
          {
            backgroundColor:
              description?.background ?? '#101B30',
          },
          picked && styles.tilePicked,
          hovered &&
            (validTarget
              ? styles.tileValid
              : styles.tileInvalid),
        ]}
      >
        {description ? (
          <>
            <Text
              style={[
                styles.tileSymbol,
                {
                  fontSize: size < 70 ? 27 : 34,
                },
              ]}
            >
              {description.symbol}
            </Text>

            <Text
              style={[
                styles.tileLevel,
                {
                  color: description.color,
                },
              ]}
            >
              NV. {tile!.level}
            </Text>
          </>
        ) : (
          <Text style={styles.emptyCell}>
            ✦
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

export default function GameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const boardWidth = Math.min(width - 30, 420);

  // Calculo responsivo del tablero 4x4.
  const cellSize = Math.floor(
    (
      boardWidth -
      2 * (BOARD_PADDING + BOARD_BORDER) -
      (GRID_SIZE - 1) * CELL_GAP
    ) / GRID_SIZE
  );

  const pitch = cellSize + CELL_GAP;

  // Estados del juego
  const [board, setBoard] = useState<Board>(
    () => createInitialBoard()
  );

  const boardRef = useRef(board);

  const [seconds, setSeconds] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [highest, setHighest] = useState(2);

  const [selected, setSelected] =
    useState<Position | null>(null);

  const [hover, setHover] =
    useState<Position | null>(null);

  const [feedback, setFeedback] = useState(
    'Arrastra una gema a otra igual y vecina.'
  );

  const scoreRef = useRef(0);
  const movesRef = useRef(0);
  const highestRef = useRef(2);
  const secondsRef = useRef(GAME_SECONDS);

  const activeRef = useRef(true);
  const lockedRef = useRef(false);

  const selectedRef =
    useRef<Position | null>(null);

  const gestureRef = useRef<{
    from: Position;
    x: number;
    y: number;
    previouslySelected: Position | null;
  } | null>(null);

  const drag = useRef(
    new Animated.ValueXY({
      x: 0,
      y: 0,
    })
  ).current;

  const refillTimeout = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const selectCell = useCallback(
    (position: Position | null) => {
      selectedRef.current = position;
      setSelected(position);
    },
    []
  );

  // Finalizar partida
  const finishGame = useCallback(
    (cause: 'time' | 'manual') => {
      if (!activeRef.current) return;

      activeRef.current = false;

      if (refillTimeout.current) {
        clearTimeout(refillTimeout.current);
      }

      router.replace({
        pathname: '/gameover',
        params: {
          score: String(scoreRef.current),
          moves: String(movesRef.current),
          best: String(highestRef.current),
          cause,
        },
      });
    },
    [router]
  );

  // Temporizador
  useEffect(() => {
    activeRef.current = true;

    const interval = setInterval(() => {
      if (!activeRef.current) return;

      secondsRef.current = Math.max(
        0,
        secondsRef.current - 1
      );

      setSeconds(secondsRef.current);

      if (secondsRef.current === 0) {
        finishGame('time');
      }
    }, 1000);

    return () => {
      clearInterval(interval);

      if (refillTimeout.current) {
        clearTimeout(refillTimeout.current);
      }

      activeRef.current = false;
    };
  }, [finishGame]);

  // Fusionar gemas
  const tryFusion = useCallback(
    (from: Position, to: Position) => {
      if (
        !activeRef.current ||
        lockedRef.current
      ) {
        return;
      }

      const result = merge(
        boardRef.current,
        from,
        to
      );

      if (!result) {
        setFeedback(
          'Solo puedes unir gemas iguales y adyacentes.'
        );
        return;
      }

      lockedRef.current = true;

      boardRef.current = result.board;
      setBoard(result.board);

      scoreRef.current += result.points;
      movesRef.current += 1;

      highestRef.current = Math.max(
        highestRef.current,
        result.newLevel
      );

      setScore(scoreRef.current);
      setMoves(movesRef.current);
      setHighest(highestRef.current);

      setFeedback(
        `¡Fusión perfecta! +${result.points} puntos`
      );

      refillTimeout.current = setTimeout(() => {
        if (!activeRef.current) return;

        const next = refill(
          boardRef.current,
          from
        );

        boardRef.current = next.board;
        setBoard(next.board);

        if (next.shuffled) {
          setFeedback(
            'Sin parejas: ¡reordenamos el tablero!'
          );
        }

        lockedRef.current = false;
        refillTimeout.current = null;
      }, 220);
    },
    []
  );

  // Detectar posicion de una gema
  const positionFromPoint = useCallback(
    (x: number, y: number): Position | null => {
      const col = Math.floor(
        (x - BOARD_PADDING - BOARD_BORDER) / pitch
      );

      const row = Math.floor(
        (y - BOARD_PADDING - BOARD_BORDER) / pitch
      );

      const position = {
        row,
        col,
      };

      return insideBoard(position)
        ? position
        : null;
    },
    [pitch]
  );

  // Gestos tactiles
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,

        onMoveShouldSetPanResponder: () => true,

        onPanResponderTerminationRequest: () => false,

        onPanResponderGrant: event => {
          if (
            lockedRef.current ||
            !activeRef.current
          ) {
            return;
          }

          const x = event.nativeEvent.locationX;
          const y = event.nativeEvent.locationY;

          const from = positionFromPoint(x, y);

          if (
            !from ||
            !boardRef.current[from.row][from.col]
          ) {
            return;
          }

          gestureRef.current = {
            from,
            x,
            y,
            previouslySelected: selectedRef.current,
          };

          drag.stopAnimation();

          drag.setValue({
            x: 0,
            y: 0,
          });

          selectCell(from);
          setHover(null);
        },

        onPanResponderMove: (
          _event,
          gestureState
        ) => {
          const gesture = gestureRef.current;

          if (
            !gesture ||
            lockedRef.current
          ) {
            return;
          }

          const distance = Math.hypot(
            gestureState.dx,
            gestureState.dy
          );

          if (
            distance < SWIPE_MIN_DISTANCE
          ) {
            return;
          }

          drag.setValue({
            x: gestureState.dx,
            y: gestureState.dy,
          });

          const target = positionFromPoint(
            gesture.x + gestureState.dx,
            gesture.y + gestureState.dy
          );

          setHover(previous =>
            samePosition(previous, target)
              ? previous
              : target
          );
        },

        onPanResponderRelease: (
          _event,
          gestureState
        ) => {
          const gesture = gestureRef.current;

          gestureRef.current = null;
          setHover(null);

          if (!gesture) return;

          const distance = Math.hypot(
            gestureState.dx,
            gestureState.dy
          );

          // Fusion mediante dos toques
          if (
            distance < SWIPE_MIN_DISTANCE
          ) {
            drag.setValue({
              x: 0,
              y: 0,
            });

            const previous =
              gesture.previouslySelected;

            if (
              previous &&
              !samePosition(
                previous,
                gesture.from
              ) &&
              canMerge(
                boardRef.current,
                previous,
                gesture.from
              )
            ) {
              tryFusion(
                previous,
                gesture.from
              );

              selectCell(null);
            } else if (
              previous &&
              samePosition(
                previous,
                gesture.from
              )
            ) {
              selectCell(null);

              setFeedback(
                'Selección cancelada. Elige una gema para fusionar.'
              );
            } else {
              selectCell(gesture.from);

              setFeedback(
                'Gema seleccionada: toca otra igual y vecina o deslízala.'
              );
            }

            return;
          }

          // Fusion mediante arrastre
          const to = positionFromPoint(
            gesture.x + gestureState.dx,
            gesture.y + gestureState.dy
          );

          if (
            to &&
            !samePosition(
              gesture.from,
              to
            )
          ) {
            tryFusion(gesture.from, to);
          } else {
            setFeedback(
              'Desliza hasta una casilla vecina dentro del tablero.'
            );
          }

          Animated.spring(drag, {
            toValue: {
              x: 0,
              y: 0,
            },
            friction: 7,
            tension: 70,
            useNativeDriver: false,
          }).start(({ finished }) => {
            if (finished) {
              selectCell(null);
            }
          });
        },

        onPanResponderTerminate: () => {
          gestureRef.current = null;
          setHover(null);

          Animated.spring(drag, {
            toValue: {
              x: 0,
              y: 0,
            },
            useNativeDriver: false,
          }).start(({ finished }) => {
            if (finished) {
              selectCell(null);
            }
          });
        },
      }),
    [
      drag,
      positionFromPoint,
      selectCell,
      tryFusion,
    ]
  );

  // Mezclar tablero
  const manualShuffle = () => {
    if (
      lockedRef.current ||
      !activeRef.current
    ) {
      return;
    }

    const next = shuffleBoard(
      boardRef.current
    );

    boardRef.current = next;
    setBoard(next);

    setFeedback(
      'Tablero mezclado. ¡Busca otra pareja!'
    );
  };

  const selectedTile =
    selected &&
    board[selected.row][selected.col];

  const targetIsValid =
    !!selected &&
    !!hover &&
    canMerge(board, selected, hover);

  return (
    <SafeAreaView style={common.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.headerRow}>
          <Brand />

          <Pressable
            onPress={() => finishGame('manual')}
            accessibilityRole="button"
            accessibilityLabel="Terminar partida"
            style={styles.exitButton}
          >
            <Text style={styles.exitText}>
              SALIR ✕
            </Text>
          </Pressable>
        </View>

        <Text
          style={[
            common.eyebrow,
            styles.modeLabel,
          ]}
        >
          MODO CONTRARRELOJ
        </Text>

        {/* Estadisticas */}
        <View style={styles.statsRow}>
          <View style={[common.surface, styles.statCard]}>
            <Text style={common.statisticLabel}>
              PUNTOS
            </Text>

            <Text style={common.statistic}>
              {score}
            </Text>
          </View>

          <View
            style={[
              common.surface,
              styles.statCard,
              seconds <= 15 && styles.timeUrgent,
            ]}
          >
            <Text style={common.statisticLabel}>
              TIEMPO
            </Text>

            <Text
              style={[
                common.statistic,
                seconds <= 15 &&
                  styles.timeUrgentText,
              ]}
            >
              {formatTime(seconds)}
            </Text>
          </View>

          <View style={[common.surface, styles.statCard]}>
            <Text style={common.statisticLabel}>
              FUSIONES
            </Text>

            <Text style={common.statistic}>
              {moves}
            </Text>
          </View>
        </View>

        {/* Encabezado del tablero */}
        <View style={styles.boardHeading}>
          <View>
            <Text style={styles.boardTitle}>
              Tablero de fusión
            </Text>

            <Text style={styles.boardSubtitle}>
              Une fichas con el mismo nivel.
            </Text>
          </View>

          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>
              NV. MÁX. {highest}
            </Text>
          </View>
        </View>

        {/* Tablero azul oscuro */}
        <View
          style={[
            styles.board,
            {
              width: boardWidth,
              height: boardWidth,
            },
          ]}
          {...responder.panHandlers}
          accessibilityLabel="Tablero de juego de cuatro por cuatro gemas"
        >
          {board.map((row, rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              pointerEvents="none"
              style={[
                styles.boardRow,
                selected?.row === rowIndex &&
                  styles.activeRow,
              ]}
            >
              {row.map((tile, colIndex) => {
                const position = {
                  row: rowIndex,
                  col: colIndex,
                };

                const picked =
                  !!selectedTile &&
                  samePosition(
                    selected,
                    position
                  );

                const hovered =
                  samePosition(
                    hover,
                    position
                  ) && !picked;

                return (
                  <GemCell
                    key={`${rowIndex}-${colIndex}`}
                    tile={tile}
                    size={cellSize}
                    picked={picked}
                    hovered={hovered}
                    validTarget={targetIsValid}
                    dragOffset={drag}
                  />
                );
              })}
            </View>
          ))}
        </View>

        {/* Mensajes */}
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackIcon}>
            ✦
          </Text>

          <Text style={styles.feedbackText}>
            {feedback}
          </Text>
        </View>

        {/* Niveles de gemas */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>
            EVOLUCIÓN DE GEMAS
          </Text>

          <View style={styles.legendRow}>
            {gems.map((gem, index) => (
              <View
                key={gem.name}
                style={styles.legendItem}
              >
                <Text style={styles.legendEmoji}>
                  {gem.symbol}
                </Text>

                <Text style={styles.legendLevel}>
                  {index + 1}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.actions}>
          <ActionButton
            label="⤨  Mezclar fichas"
            variant="secondary"
            onPress={manualShuffle}
            style={styles.shuffleButton}
          />

          <ActionButton
            label="Terminar partida"
            variant="danger"
            onPress={() => finishGame('manual')}
            style={styles.shuffleButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 30,
  },

  headerRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  exitButton: {
    paddingVertical: 11,
    paddingLeft: 8,
  },

  exitText: {
    color: palette.muted,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '800',
  },

  modeLabel: {
    alignSelf: 'flex-start',
    marginTop: 29,
    marginBottom: 12,
    marginLeft: 4,
  },

  statsRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 8,
  },

  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 86,
    gap: 9,
    borderRadius: 17,
  },

  timeUrgent: {
    borderColor: palette.red,
  },

  timeUrgentText: {
    color: palette.red,
  },

  boardHeading: {
    marginTop: 25,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 3,
  },

  boardTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
  },

  boardSubtitle: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 4,
  },

  levelBadge: {
    backgroundColor: '#D9F3E5',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  levelBadgeText: {
    color: palette.purple,
    fontWeight: '900',
    fontSize: 9,
  },

  // Tablero azul oscuro
  board: {
    borderRadius: 18,
    padding: BOARD_PADDING,
    flexDirection: 'column',
    gap: CELL_GAP,
    borderWidth: BOARD_BORDER,
    borderColor: '#456184',
    backgroundColor: '#233451',
    overflow: 'visible',
  },

  boardRow: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },

  activeRow: {
    zIndex: 20,
    elevation: 20,
  },

  tileOuter: {
    borderRadius: 13,
  },

  tile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#56728C',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  tilePicked: {
    borderWidth: 2.5,
    borderColor: palette.gold,
    shadowColor: palette.gold,
    shadowOpacity: 0.5,
    shadowRadius: 9,
  },

  tileValid: {
    borderWidth: 3,
    borderColor: palette.turquoise,
  },

  tileInvalid: {
    borderWidth: 2.5,
    borderColor: palette.red,
  },

  tileSymbol: {
    textAlign: 'center',
  },

  tileLevel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.9,
    marginTop: 1,
  },

  emptyCell: {
    fontSize: 22,
    color: '#39506D',
  },

  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: 54,
    paddingHorizontal: 14,
    marginTop: 14,
    borderRadius: 13,
    backgroundColor: '#E2F6E9',
    borderWidth: 1,
    borderColor: '#B6DEC5',
  },

  feedbackIcon: {
    color: palette.turquoise,
    fontSize: 18,
    marginRight: 10,
  },

  feedbackText: {
    color: '#1C563A',
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },

  legend: {
    alignSelf: 'stretch',
    marginTop: 19,
  },

  legendTitle: {
    fontSize: 10,
    letterSpacing: 1.9,
    color: palette.muted,
    fontWeight: '900',
    textAlign: 'center',
  },

  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 13,
  },

  legendItem: {
    alignItems: 'center',
    gap: 5,
  },

  legendEmoji: {
    fontSize: 25,
  },

  legendLevel: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: '700',
  },

  actions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 9,
    marginTop: 26,
  },

  shuffleButton: {
    flex: 1,
    minHeight: 48,
  },
});
