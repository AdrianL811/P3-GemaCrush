
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme';

export function Brand() {
  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <Text style={styles.icon}>💎</Text>
      </View>

      <View>
        <Text style={styles.name}>GEMACRUSH</Text>
        <Text style={styles.subtitle}>
          FUSIÓN DE GEMAS
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  mark: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.turquoiseDark,
    borderWidth: 1,
    borderColor: palette.turquoise,
  },

  icon: {
    fontSize: 25,
  },

  name: {
    color: palette.text,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1.6,
  },

  subtitle: {
    color: palette.muted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
  },
});
