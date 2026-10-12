
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ActionButton } from '../components/ActionButton';
import { Brand } from '../components/Brand';
import { common, gems, palette } from '../theme';

const instructions = [
  {
    number: '01',
    title: 'Selecciona',
    description:
      'Desliza una gema o toca dos gemas vecinas.',
  },
  {
    number: '02',
    title: 'Fusiona',
    description:
      'Solo se unen dos gemas iguales, en horizontal o vertical.',
  },
  {
    number: '03',
    title: 'Suma puntos',
    description:
      'Cada fusión aumenta el nivel y tu puntuación.',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={common.safe}>
      <ScrollView contentContainerStyle={common.scrollContent}>
        <Brand />

        <View style={styles.hero}>

          <Text style={[common.title, styles.heroTitle]}>
            Elige, fusiona y{'\n'}
            <Text style={styles.accent}>
              Supera tu récord.
            </Text>
          </Text>

          <Text style={common.body}>
            Combina cristales del mismo nivel,
            crea gemas cada vez más poderosas
            y consigue la mayor puntuación
            antes de que termine el tiempo.
          </Text>

          <View style={styles.gemRow}>
            {gems.map(gem => (
              <View
                key={gem.name}
                style={[
                  styles.gemBubble,
                  {
                    backgroundColor: gem.background,
                  },
                ]}
              >
                <Text style={styles.gemSymbol}>
                  {gem.symbol}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[common.surface, styles.rulesBox]}>
          <Text style={styles.sectionTitle}>
            ¿Cómo se juega?
          </Text>

          {instructions.map(item => (
            <View
              key={item.number}
              style={styles.instructionRow}
            >
              <Text style={styles.number}>
                {item.number}
              </Text>

              <View style={styles.instructionContent}>
                <Text style={styles.instructionTitle}>
                  {item.title}
                </Text>

                <Text style={styles.instructionDescription}>
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <ActionButton
            label="JUGAR AHORA  →"
            onPress={() => router.push('/game')}
          />

          <ActionButton
            label="Créditos del proyecto"
            variant="secondary"
            onPress={() => router.push('/credits')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: 38,
    marginBottom: 25,
  },

  heroTitle: {
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 47,
  },

  accent: {
    color: palette.turquoise,
  },

  gemRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 27,
  },

  gemBubble: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },

  gemSymbol: {
    fontSize: 26,
  },

  rulesBox: {
    padding: 22,
  },

  sectionTitle: {
    color: palette.text,
    fontWeight: '900',
    fontSize: 19,
    marginBottom: 13,
  },

  instructionRow: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },

  number: {
    color: palette.turquoise,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },

  instructionContent: {
    flex: 1,
  },

  instructionTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },

  instructionDescription: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
  },

  buttons: {
    marginTop: 22,
    gap: 12,
  },
});
