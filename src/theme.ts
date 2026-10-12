
import { StyleSheet } from 'react-native';

// Paleta principal de GemaCrush
export const palette = {
  background: '#F4FBF6',
  surface: '#FFFFFF',
  surfaceRaised: '#E6F5EC',
  border: '#C3E0CE',
  text: '#153B2B',
  muted: '#557363',
  turquoise: '#16845B',
  turquoiseDark: '#D5F2E1',
  gold: '#FFD17C',
  red: '#C84956',
  purple: '#28845B',
};

// Los colores de las gemas se conservan
// para distinguir sus distintos niveles.
export const gems = [
  {
    name: 'Gota',
    symbol: '💧',
    color: '#75CAFF',
    background: '#193553',
  },
  {
    name: 'Cristal',
    symbol: '🔹',
    color: '#52D5F0',
    background: '#174554',
  },
  {
    name: 'Zafiro',
    symbol: '💠',
    color: '#A3BAFF',
    background: '#303B73',
  },
  {
    name: 'Diamante',
    symbol: '💎',
    color: '#BAF1FF',
    background: '#2F5675',
  },
  {
    name: 'Estrella',
    symbol: '🌟',
    color: '#FFDB80',
    background: '#624A2B',
  },
  {
    name: 'Corona',
    symbol: '👑',
    color: '#FFE08E',
    background: '#674C35',
  },
] as const;

// Estilos reutilizables para todas las pantallas
export const common = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 30,
  },

  eyebrow: {
    color: palette.turquoise,
    fontSize: 12,
    letterSpacing: 2.7,
    fontWeight: '800',
  },

  title: {
    color: palette.text,
    fontSize: 39,
    fontWeight: '900',
    letterSpacing: -1.3,
  },

  body: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 24,
  },

  surface: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 24,
  },

  statistic: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },

  statisticLabel: {
    color: palette.muted,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '800',
  },
});
