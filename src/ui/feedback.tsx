import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import { createStyles, motion, radius, space, useTheme } from '@/theme';
import { Icon, type IconName } from './icon';
import { Text } from './text';

const NOTICE_ENTER = FadeIn.duration(motion.duration.quick)
  .easing(motion.easing.easeOut)
  .reduceMotion(ReduceMotion.Never);

/**
 * Inline error next to the action that failed. It fades in so it does not
 * jump into place, and announces itself to screen readers.
 */
export function Notice({
  message,
  action,
}: {
  message: string | null | undefined;
  action?: ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  if (!message) return null;
  return (
    <Animated.View
      entering={NOTICE_ENTER}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={styles.notice}
    >
      <View style={styles.noticeRow}>
        <Icon name="alert" size={18} color={colors.accent} weight="medium" />
        <Text variant="subhead" style={styles.noticeText}>
          {message}
        </Text>
      </View>
      {action}
    </Animated.View>
  );
}

interface EmptyStateProps {
  icon: IconName;
  title: string;
  body: string;
  /**
   * Centers the state in the space it is given, for screens with nothing else.
   * It sits a little above true center, where the eye lands first.
   */
  centered?: boolean;
  children?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  body,
  centered,
  children,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const content = (
    <View style={[styles.empty, centered && styles.emptyCenteredContent]}>
      <View style={styles.emptyMark}>
        <Icon name={icon} size={26} color={colors.muted} />
      </View>
      <View style={styles.emptyCopy}>
        <Text
          variant="headline"
          accessibilityRole="header"
          align={centered ? 'center' : undefined}
        >
          {title}
        </Text>
        <Text
          variant="subhead"
          tone="muted"
          align={centered ? 'center' : undefined}
        >
          {body}
        </Text>
      </View>
      {children && <View style={styles.emptyActions}>{children}</View>}
    </View>
  );
  if (!centered) return content;
  return (
    <View style={styles.emptyCentered}>
      <View style={styles.emptyAbove} />
      {content}
      <View style={styles.emptyBelow} />
    </View>
  );
}

const useStyles = createStyles(({ colors }) => ({
  notice: {
    gap: space.md,
    padding: space.md,
    paddingLeft: space.md + 2,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSubtle,
  },
  noticeRow: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  noticeText: { flex: 1 },
  empty: {
    gap: space.lg,
    paddingVertical: space.xxl,
    paddingHorizontal: space.gutter,
    alignItems: 'flex-start',
  },
  emptyCentered: { flexGrow: 1 },
  // Optical center: twice the space below as above.
  emptyAbove: { flex: 1 },
  emptyBelow: { flex: 2 },
  emptyCenteredContent: {
    alignItems: 'center',
    maxWidth: 360,
    alignSelf: 'center',
  },
  emptyMark: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.rule,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  emptyCopy: { gap: space.xs },
  emptyActions: { alignSelf: 'stretch', gap: space.sm },
}));
