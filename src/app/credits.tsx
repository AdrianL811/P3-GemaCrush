
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
import { common, palette } from '../theme';

export default function CreditsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={common.safe}>
      <ScrollView
        contentContainerStyle={common.scrollContent}
      >
        {/* NOMBRE Y LOGOTIPO */}

        <View style={styles.brandContainer}>
          <Brand />
        </View>

        {/* TITULO DE CREDITOS */}

        <View style={styles.titleContainer}>
          <Text style={common.title}>
            Créditos
          </Text>
        </View>

        {/* RECUADRO DE CREDITOS */}

        <View style={[common.surface, styles.panel]}>

          <Text style={styles.panelTitle}>
            Equipo de desarrollo
          </Text>

          <Text style={styles.panelBody}>
            Integrantes: Leyva Durante Adrián Emiliano,
            Ruiz Cerdeño Patricio, Espinosa Hinojosa
            Edgar Allan.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.panelTitle}>
            Tecnologías
          </Text>

          <Text style={styles.panelBody}>
            React Native · Expo · Expo Router ·
            TypeScript · Animated · PanResponder
          </Text>

          <View style={styles.divider} />

          <Text style={styles.panelTitle}>
            Diseño y gráficos
          </Text>

          <Text style={styles.panelBody}>
            Se utilizaron emojis del sistema para
            representar seis niveles de gemas.
            Su apariencia puede variar según
            el dispositivo.
          </Text>

        </View>

        {/* BOTON DE REGRESO */}

        <View style={styles.buttonContainer}>
          <ActionButton
            label="← Volver al inicio"
            variant="secondary"
            onPress={() => router.replace('/')}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  // Separacion entre logotipo y titulo
  brandContainer: {
    marginTop: 14,
    marginBottom: 48,
  },

  // Separacion entre titulo y recuadro
  titleContainer: {
    marginBottom: 34,
  },

  // Recuadro principal
  panel: {
    padding: 22,
    gap: 12,
  },

  panelTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: palette.text,
    marginBottom: 5,
  },

  panelBody: {
    fontSize: 14,
    lineHeight: 24,
    color: palette.muted,
  },

  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: 19,
  },

  // Separacion entre recuadro y boton
  buttonContainer: {
    marginTop: 34,
    marginBottom: 20,
  },

});
