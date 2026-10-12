import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { Brand } from '../components/Brand';
import { common, gems, palette } from '../theme';

function safeNumber(value: string | string[] | undefined): number {
  const number = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : 0;
}

export default function GameOverScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ score?: string; moves?: string; best?: string; cause?: string }>();
  const score = safeNumber(params.score);
  const moves = safeNumber(params.moves);
  const best = Math.min(6, Math.max(1, safeNumber(params.best)));
  const description = params.cause === 'manual' ? 'Partida terminada' : '¡Se acabó el tiempo!';
  return (
    <SafeAreaView style={common.safe}>
      <ScrollView contentContainerStyle={[common.scrollContent, styles.layout]}>
        <Brand />
        <View style={styles.center}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={common.eyebrow}>{description.toUpperCase()}</Text>
          <Text style={[common.title, styles.title]}>GAME OVER</Text>
          <Text style={common.body}>¡Bien jugado! Estas fueron tus estadísticas:</Text>
          <View style={[common.surface, styles.scorePanel]}>
            <Text style={common.statisticLabel}>PUNTUACIÓN FINAL</Text>
            <Text style={styles.mainScore}>{score.toLocaleString('es-MX')}</Text>
            <View style={styles.statRow}>
              <View style={styles.stat}><Text style={common.statisticLabel}>FUSIONES</Text><Text style={common.statistic}>{moves}</Text></View>
              <View style={styles.stat}><Text style={common.statisticLabel}>MEJOR GEMA</Text><Text style={styles.bestGem}>{gems[best - 1].symbol}</Text><Text style={styles.bestLevel}>Nivel {best}</Text></View>
            </View>
          </View>
        </View>
        <View style={styles.buttons}>
          <ActionButton label="JUGAR OTRA VEZ  ↻" onPress={() => router.replace('/game')} />
          <ActionButton label="Volver al inicio" variant="secondary" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  layout: { justifyContent: 'space-between' },
  center: { alignItems: 'center', paddingVertical: 26 },
  trophy: { fontSize: 79, marginBottom: 20 },
  title: { marginTop: 10, marginBottom: 12 },
  scorePanel: { alignSelf: 'stretch', marginTop: 30, alignItems: 'center', padding: 24 },
  mainScore: { color: palette.turquoise, fontSize: 57, fontWeight: '900', fontVariant: ['tabular-nums'], marginVertical: 11 },
  statRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: palette.border, paddingTop: 23, marginTop: 10, width: '100%' },
  stat: { flex: 1, alignItems: 'center', minHeight: 73 },
  bestGem: { fontSize: 28, marginTop: 5 },
  bestLevel: { color: palette.muted, fontSize: 11 },
  buttons: { gap: 12, marginBottom: 10 },
});
