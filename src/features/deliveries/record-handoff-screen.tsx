import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRecord, useStore } from '@/data/store';
import { completeDelivery } from '@/domain/model';
import type { Photo } from '@/domain/validation';
import { useAction } from '@/hooks/use-action';
import { useUnsavedGuard } from '@/hooks/use-unsaved-guard';
import { haptics } from '@/lib/haptics';
import { createStyles, motion, space } from '@/theme';
import {
  Block,
  Button,
  EmptyState,
  Footer,
  HeaderButton,
  Notice,
  ScrollScreen,
  Text,
  TextField,
} from '@/ui';
import { EvidencePhoto, PhotoField } from './components/photo-evidence';

type Step = 'details' | 'review';

const STEP_ENTER = FadeIn.duration(motion.duration.base).easing(
  motion.easing.easeOut,
);
const STEP_EXIT = FadeOut.duration(motion.duration.quick).easing(
  motion.easing.easeOut,
);

export function RecordHandoffScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const record = useRecord(id);
  const { change } = useStore();
  const styles = useStyles();
  const action = useAction();
  const [step, setStep] = useState<Step>('details');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<Photo | null>(null);
  /** Set once the write succeeds, so the dismiss animation keeps this screen intact. */
  const [confirmed, setConfirmed] = useState(false);
  const allowLeave = useUnsavedGuard(
    Boolean(recipient.trim() || note.trim() || photo),
    'The recipient, photo and note you entered will be lost.',
  );

  const ready = Boolean(recipient.trim() && photo);
  const missing = [
    recipient.trim() ? null : 'the recipient’s name',
    photo ? null : 'a photo',
  ].filter(Boolean);

  function confirm() {
    void action.run(async () => {
      await change(id, (old) =>
        completeDelivery(
          old,
          recipient,
          note,
          photo,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        ),
      );
      haptics.success();
      setConfirmed(true);
      allowLeave();
      router.back();
    });
  }

  if (!record)
    return (
      <ScrollScreen>
        <EmptyState
          icon="package"
          title="Delivery not found"
          body="It may have been deleted on this device."
        >
          <Button label="Close" onPress={() => router.back()} />
        </EmptyState>
      </ScrollScreen>
    );

  if (record.status === 'completed' && !confirmed && !action.busy)
    return (
      <ScrollScreen>
        <EmptyState
          icon="delivered"
          title="Already delivered"
          body="This handoff was recorded earlier. Its receipt is read-only."
        >
          <Button label="Close" onPress={() => router.back()} />
        </EmptyState>
      </ScrollScreen>
    );

  const review = step === 'review';

  return (
    <>
      <Stack.Screen
        options={{
          title: review ? 'Review handoff' : 'Record handoff',
          headerLeft: () => (
            <HeaderButton
              label="Cancel"
              accessibilityLabel="Cancel"
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <ScrollScreen
        footer={
          <Footer>
            {review ? (
              <>
                <Button
                  label="Confirm delivery"
                  icon="delivered"
                  busy={action.busy}
                  onPress={confirm}
                />
                <Button
                  label="Edit details"
                  variant="plain"
                  disabled={action.busy}
                  onPress={() => setStep('details')}
                />
              </>
            ) : (
              <>
                {!ready && (
                  <Text variant="footnote" tone="muted" align="center">
                    Add {missing.join(' and ')} to continue.
                  </Text>
                )}
                <Button
                  label="Review handoff"
                  disabled={!ready}
                  onPress={() => setStep('review')}
                />
              </>
            )}
          </Footer>
        }
      >
        <Block gap={space.xs}>
          <Text variant="eyebrow" tone="muted" caps>
            {record.reference}
          </Text>
          <Text variant="headline">{record.destination}</Text>
        </Block>
        <View style={styles.rule} />

        {review ? (
          <Animated.View key="review" entering={STEP_ENTER} exiting={STEP_EXIT}>
            <Block gap={space.xl}>
              <Field label="Received by" value={recipient.trim()} />
              <Field
                label="Note"
                value={note.trim() || 'No note'}
                muted={!note.trim()}
              />
              {photo && <EvidencePhoto photo={photo} />}
              <Text variant="footnote" tone="muted">
                Confirming saves this device’s current time and time zone, and
                makes the receipt read-only.
              </Text>
              <Notice message={action.error} />
            </Block>
          </Animated.View>
        ) : (
          <Animated.View
            key="details"
            entering={STEP_ENTER}
            exiting={STEP_EXIT}
          >
            <Block gap={space.xl}>
              <TextField
                label="Recipient name"
                requirement="required"
                value={recipient}
                onChangeText={setRecipient}
                placeholder="Who received it?"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                maxLength={100}
                returnKeyType="done"
              />
              <PhotoField value={photo} onChange={setPhoto} />
              <TextField
                label="Note"
                requirement="optional"
                value={note}
                onChangeText={setNote}
                placeholder="Left with the front desk, signed by security…"
                multiline
                maxLength={1000}
              />
            </Block>
          </Animated.View>
        )}
      </ScrollScreen>
    </>
  );
}

function Field({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  const styles = useStyles();
  return (
    <View style={styles.field}>
      <Text variant="eyebrow" tone="muted" caps>
        {label}
      </Text>
      <Text variant={muted ? 'body' : 'title'} tone={muted ? 'muted' : 'ink'}>
        {value}
      </Text>
    </View>
  );
}

const useStyles = createStyles(({ colors }) => ({
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.rule,
    marginHorizontal: space.gutter,
  },
  field: { gap: space.xs },
}));
