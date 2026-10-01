import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRecord, useStore } from '@/data/store';
import type { AppRecord } from '@/domain/model';
import { useAction } from '@/hooks/use-action';
import { confirmDestructive } from '@/lib/confirm';
import { createStyles, motion, space, useTheme } from '@/theme';
import {
  Block,
  Button,
  EmptyState,
  Footer,
  Icon,
  Notice,
  ScrollScreen,
  Section,
  Text,
} from '@/ui';
import { HandoffTimeline } from './components/handoff-timeline';
import { EvidencePhoto } from './components/photo-evidence';

const EVIDENCE_ENTER = FadeIn.duration(motion.duration.enter)
  .delay(80)
  .easing(motion.easing.easeOut);

export function DeliveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const stored = useRecord(id);
  /** Keeps the deleted record on screen while the back transition runs. */
  const [leaving, setLeaving] = useState<AppRecord>();
  const record = stored ?? leaving;
  const { remove } = useStore();
  const { colors } = useTheme();
  const styles = useStyles();
  const action = useAction();
  /** Status when the screen opened; a change means the handoff was confirmed just now. */
  const [openedAs] = useState(stored?.status);

  if (!record)
    return (
      <>
        <Stack.Screen options={{ title: 'Delivery' }} />
        <ScrollScreen>
          <EmptyState
            icon="package"
            title="Delivery not found"
            body="It may have been deleted on this device."
          >
            <Button label="Back to deliveries" onPress={() => router.back()} />
          </EmptyState>
        </ScrollScreen>
      </>
    );

  const completed = record.status === 'completed';
  const justCompleted = completed && openedAs === 'pending';

  const deleteDelivery = async () => {
    const confirmed = await confirmDestructive({
      title: `Delete ${record.reference}?`,
      message: completed
        ? 'The receipt and its photo will be removed from this device. This cannot be undone.'
        : 'This delivery will be removed from this device. This cannot be undone.',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;
    await action.run(async () => {
      setLeaving(record);
      await remove([record.id]);
      router.back();
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: completed ? 'Receipt' : 'Delivery' }} />
      <ScrollScreen
        footer={
          completed ? undefined : (
            <Footer>
              <Button
                label="Record handoff"
                icon="camera"
                onPress={() =>
                  router.push({
                    pathname: '/confirm/[id]',
                    params: { id: record.id },
                  })
                }
              />
            </Footer>
          )
        }
      >
        <Block gap={space.sm}>
          <Text variant="eyebrow" tone="muted" caps>
            Reference
          </Text>
          <Text
            variant="codeDisplay"
            accessibilityRole="header"
            selectable
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {record.reference}
          </Text>
          <Text variant="title" selectable>
            {record.destination}
          </Text>
          <View style={styles.stamp}>
            <Icon
              name={completed ? 'delivered' : 'pending'}
              size={16}
              color={completed ? colors.accent : colors.muted}
              weight="semibold"
            />
            <Text variant="eyebrow" tone={completed ? 'accent' : 'muted'} caps>
              {completed ? 'Delivered' : 'Awaiting handoff'}
            </Text>
          </View>
        </Block>

        <View style={styles.rule} />

        <Block>
          <HandoffTimeline record={record} justCompleted={justCompleted} />
        </Block>

        {completed && record.photo && (
          <Animated.View entering={justCompleted ? EVIDENCE_ENTER : undefined}>
            <Section title="Photo evidence">
              <View style={styles.evidence}>
                <EvidencePhoto photo={record.photo} />
              </View>
            </Section>
          </Animated.View>
        )}

        {completed && (
          <Block gap={space.sm}>
            <Text
              variant="eyebrow"
              tone="muted"
              caps
              accessibilityRole="header"
            >
              Note
            </Text>
            <Text
              variant="body"
              tone={record.note ? 'ink' : 'muted'}
              selectable
            >
              {record.note || 'No note added.'}
            </Text>
          </Block>
        )}

        <Block gap={space.lg}>
          <Notice message={action.error} />
          <View style={styles.destructive}>
            <Button
              label="Delete delivery"
              icon="trash"
              variant="destructive"
              compact
              busy={action.busy}
              onPress={() => void deleteDelivery()}
            />
          </View>
        </Block>
      </ScrollScreen>
    </>
  );
}

const useStyles = createStyles(({ colors }) => ({
  stamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.sm,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.rule,
    marginHorizontal: space.gutter,
  },
  evidence: { padding: space.gutter },
  destructive: { alignItems: 'flex-start', marginLeft: -space.sm },
}));
