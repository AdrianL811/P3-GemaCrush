
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { palette } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  disabled?: boolean;
};

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  style,
  disabled,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,

        variant === 'primary'
          ? styles.primary
          : variant === 'danger'
            ? styles.danger
            : styles.secondary,

        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,

          variant === 'primary'
            ? styles.primaryLabel
            : variant === 'danger'
              ? styles.dangerLabel
              : styles.secondaryLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 55,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
  },

  primary: {
    backgroundColor: palette.turquoise,
    borderColor: palette.turquoise,
  },

  secondary: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
  },

  danger: {
    backgroundColor: '#FCECEF',
    borderColor: '#DFA6B0',
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },

  disabled: {
    opacity: 0.45,
  },

  label: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  primaryLabel: {
    color: '#FFFFFF',
  },

  secondaryLabel: {
    color: palette.text,
  },

  dangerLabel: {
    color: '#922E41',
  },
});
