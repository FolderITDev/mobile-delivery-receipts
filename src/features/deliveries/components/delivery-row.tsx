import { View } from 'react-native';
import type { AppRecord } from '@/domain/model';
import { formatRelative, ordinal } from '@/lib/format';
import { createStyles, space, useTheme } from '@/theme';
import { Icon, Row, Text } from '@/ui';

interface Props {
  record: AppRecord;
  index: number;
  onPress: () => void;
}

/** Ordinal, reference, destination and a worded state: a line on a dispatch label. */
export function DeliveryRow({ record, index, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  const delivered = record.status === 'completed';
  const when = formatRelative(
    delivered ? record.deliveredAt! : record.createdAt,
  );
  const state = delivered
    ? `Delivered to ${record.recipient}`
    : 'Awaiting handoff';
  return (
    <Row
      onPress={onPress}
      navigates
      accessibilityLabel={`${record.reference}, ${record.destination}. ${state}. ${when}.`}
      accessibilityHint={delivered ? 'Opens the receipt' : 'Opens the delivery'}
    >
      <View style={styles.layout}>
        <Text variant="ordinal" tone="tertiary" tabular style={styles.ordinal}>
          {ordinal(index)}
        </Text>
        <View style={styles.body}>
          <View style={styles.reference}>
            <Text variant="eyebrow" tone="muted" caps>
              {record.reference}
            </Text>
          </View>
          <Text variant="headline" numberOfLines={2}>
            {record.destination}
          </Text>
          <View style={styles.state}>
            <Icon
              name={delivered ? 'delivered' : 'pending'}
              size={14}
              color={delivered ? colors.accent : colors.muted}
              weight="medium"
            />
            <Text
              variant="footnote"
              tone="muted"
              numberOfLines={2}
              style={styles.stateText}
            >
              {state} · {when}
            </Text>
          </View>
        </View>
      </View>
    </Row>
  );
}

/** Left inset that aligns separators with the row text, past the ordinal column. */
export const DELIVERY_ROW_TEXT_INSET = space.gutter + 36 + space.md;

const useStyles = createStyles(() => ({
  layout: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  ordinal: { width: 36 },
  body: { flex: 1, gap: space.xs },
  reference: { flexDirection: 'row', gap: space.xs, alignItems: 'center' },
  state: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
    marginTop: space.xxs,
  },
  stateText: { flexShrink: 1 },
}));
