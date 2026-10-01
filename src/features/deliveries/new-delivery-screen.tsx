import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { router, Stack } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { useStore } from '@/data/store';
import { createDelivery } from '@/domain/model';
import { useAction } from '@/hooks/use-action';
import { useUnsavedGuard } from '@/hooks/use-unsaved-guard';
import { haptics } from '@/lib/haptics';
import { Block, HeaderButton, Notice, ScrollScreen, TextField } from '@/ui';

export function NewDeliveryScreen() {
  const { add } = useStore();
  const action = useAction();
  const [reference, setReference] = useState('');
  const [destination, setDestination] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const referenceField = useRef<TextInput>(null);
  const destinationField = useRef<TextInput>(null);
  const allowLeave = useUnsavedGuard(
    Boolean(reference.trim() || destination.trim()),
    'This delivery has not been created yet.',
  );

  const errors = {
    reference: reference.trim()
      ? null
      : 'Enter the reference on the package label.',
    destination: destination.trim()
      ? null
      : 'Enter where the package is going.',
  };
  const valid = !errors.reference && !errors.destination;

  function create() {
    setSubmitted(true);
    if (!valid) {
      haptics.error();
      (errors.reference ? referenceField : destinationField).current?.focus();
      return;
    }
    void action.run(async () => {
      const record = createDelivery(randomUUID(), reference, destination);
      await add(record);
      haptics.success();
      allowLeave();
      router.replace({ pathname: '/delivery/[id]', params: { id: record.id } });
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <HeaderButton
              label="Cancel"
              accessibilityLabel="Cancel"
              onPress={() => router.back()}
            />
          ),
          headerRight: () => (
            <HeaderButton
              label="Create"
              prominent
              accessibilityLabel="Create delivery"
              busy={action.busy}
              onPress={create}
            />
          ),
        }}
      />
      <ScrollScreen>
        <Block gap={24}>
          <TextField
            ref={referenceField}
            label="Reference"
            requirement="required"
            value={reference}
            onChangeText={setReference}
            placeholder="PKG-1051"
            hint="Printed on the package label."
            error={submitted ? errors.reference : null}
            mono
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
            maxLength={40}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => destinationField.current?.focus()}
          />
          <TextField
            ref={destinationField}
            label="Destination"
            requirement="required"
            value={destination}
            onChangeText={setDestination}
            placeholder="Building and receiving point"
            error={submitted ? errors.destination : null}
            autoCapitalize="sentences"
            maxLength={100}
            returnKeyType="done"
            onSubmitEditing={create}
          />
          <Notice message={action.error} />
        </Block>
      </ScrollScreen>
    </>
  );
}
