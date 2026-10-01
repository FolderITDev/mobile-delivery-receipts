import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { AppRecord } from '@/domain/model';
import { formatDateTime, formatTimeZone } from '@/lib/format';
import { createStyles, motion, space } from '@/theme';
import { Text } from '@/ui';

/**
 * Reduce Motion keeps this opacity-only fade (a state change explained, not
 * movement), which Reanimated's default would otherwise skip entirely.
 */
const COMPLETED_ENTER = FadeIn.duration(motion.duration.enter).easing(
  motion.easing.easeOut,
);

interface Props {
  record: AppRecord;
  /** True only when the handoff was confirmed while this screen was open. */
  justCompleted: boolean;
}

/** The ruled timeline: created, then the handoff with device time and zone. */
export function HandoffTimeline({ record, justCompleted }: Props) {
  const completed = record.status === 'completed';
  return (
    <View accessibilityRole="list">
      <Step
        title="Delivery created"
        detail={formatDateTime(record.createdAt)}
        reached
        last={false}
      />
      <Animated.View
        key={record.status}
        entering={justCompleted ? COMPLETED_ENTER : undefined}
      >
        {completed ? (
          <Step
            title={`Received by ${record.recipient}`}
            detail={formatDateTime(record.deliveredAt!, record.timeZone)}
            meta={formatTimeZone(record.deliveredAt!, record.timeZone!)}
            reached
            last
          />
        ) : (
          <Step
            title="Awaiting handoff"
            detail="Record who received it and a photo at the receiving point."
            reached={false}
            last
          />
        )}
      </Animated.View>
    </View>
  );
}

interface StepProps {
  title: string;
  detail: string;
  meta?: string;
  reached: boolean;
  last: boolean;
}

function Step({ title, detail, meta, reached, last }: StepProps) {
  const styles = useStyles();
  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${detail}${meta ? `. ${meta}` : ''}. ${
        reached ? 'Done' : 'Not yet'
      }.`}
      style={styles.step}
    >
      <View style={styles.rail}>
        <View
          style={[styles.node, reached ? styles.nodeReached : styles.nodeOpen]}
        />
        {!last && <View style={styles.line} />}
      </View>
      <View style={styles.stepBody}>
        <Text variant="headline" tone={reached ? 'ink' : 'muted'}>
          {title}
        </Text>
        <Text variant="subhead" tone="muted" tabular>
          {detail}
        </Text>
        {meta && (
          <Text variant="footnote" tone="tertiary">
            {meta}
          </Text>
        )}
      </View>
    </View>
  );
}

const NODE = 12;

const useStyles = createStyles(({ colors }) => ({
  step: { flexDirection: 'row', gap: space.lg },
  rail: { width: NODE, alignItems: 'center', paddingTop: 5 },
  node: { width: NODE, height: NODE, borderRadius: 2 },
  nodeReached: { backgroundColor: colors.accent },
  nodeOpen: {
    borderWidth: 1.5,
    borderColor: colors.control,
    backgroundColor: colors.canvas,
  },
  line: {
    flex: 1,
    width: 1,
    marginVertical: space.xs,
    backgroundColor: colors.rule,
  },
  stepBody: { flex: 1, gap: space.xxs, paddingBottom: space.xl },
}));
