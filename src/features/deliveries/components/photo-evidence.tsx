import { useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import {
  CameraPermissionError,
  selectPhoto,
  storePhoto,
  type PhotoSource,
} from '@/data/capture-photo';
import { photoUri } from '@/data/photos';
import type { Photo } from '@/domain/validation';
import { useAction } from '@/hooks/use-action';
import { haptics } from '@/lib/haptics';
import { createStyles, radius, space, useTheme } from '@/theme';
import { Button, Icon, Notice, Text } from '@/ui';

/** A stored evidence photo. A missing file never hides the text record. */
export function EvidencePhoto({ photo }: { photo: Photo }) {
  const styles = useStyles();
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <View style={[styles.frame, styles.placeholder]}>
        <Text variant="subhead" tone="muted" align="center">
          Photo unavailable on this device. The rest of the record is saved.
        </Text>
      </View>
    );
  return (
    <Image
      source={{ uri: photoUri(photo) }}
      accessibilityLabel="Photo evidence of the handoff"
      contentFit="cover"
      transition={150}
      onError={() => setFailed(true)}
      style={styles.frame}
    />
  );
}

interface PhotoFieldProps {
  value: Photo | null;
  onChange: (photo: Photo | null) => void;
}

/**
 * Evidence input. The camera is the primary path; the library is always
 * offered as an alternative, including when camera access is denied.
 */
export function PhotoField({ value, onChange }: PhotoFieldProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const action = useAction();
  const [blocked, setBlocked] = useState(false);
  /** True only while the chosen image is resized and saved, not while a picker is open. */
  const [processing, setProcessing] = useState(false);

  function take(source: PhotoSource) {
    void action.run(async () => {
      try {
        const asset = await selectPhoto(source);
        if (!asset) return;
        setProcessing(true);
        const photo = await storePhoto(asset).finally(() =>
          setProcessing(false),
        );
        setBlocked(false);
        haptics.tap();
        onChange(photo);
      } catch (error) {
        if (error instanceof CameraPermissionError)
          setBlocked(!error.canAskAgain);
        throw error;
      }
    });
  }

  return (
    <View style={styles.root}>
      <View style={styles.labelRow}>
        <Text variant="label">Photo evidence</Text>
        <Text variant="footnote" tone="muted">
          Required
        </Text>
      </View>
      {value ? (
        <EvidencePhoto key={value.id} photo={value} />
      ) : (
        <View style={[styles.frame, styles.empty]}>
          {processing ? (
            <>
              <ActivityIndicator color={colors.muted} />
              <Text variant="subhead" tone="muted">
                Preparing photo…
              </Text>
            </>
          ) : (
            <>
              <Icon name="camera" size={28} color={colors.muted} />
              <Text variant="subhead" tone="muted" align="center">
                Show the package at the receiving point.
              </Text>
            </>
          )}
        </View>
      )}
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button
            label={value ? 'Retake' : 'Take photo'}
            icon={value ? 'retake' : 'camera'}
            variant="secondary"
            compact
            disabled={action.busy}
            onPress={() => take('camera')}
          />
        </View>
        <View style={styles.action}>
          <Button
            label={value ? 'Replace' : 'Library'}
            icon="library"
            variant="secondary"
            compact
            disabled={action.busy}
            accessibilityLabel={
              value
                ? 'Replace with a photo from your library'
                : 'Choose from library'
            }
            onPress={() => take('library')}
          />
        </View>
      </View>
      {value && (
        <Button
          label="Remove photo"
          variant="plain"
          compact
          disabled={action.busy}
          onPress={() => onChange(null)}
        />
      )}
      <Notice
        message={action.error}
        action={
          blocked ? (
            <Button
              label="Open Settings"
              variant="secondary"
              compact
              onPress={() => void Linking.openSettings()}
            />
          ) : undefined
        }
      />
    </View>
  );
}

const useStyles = createStyles(({ colors }) => ({
  root: { gap: space.md },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  frame: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.imageOutline,
    backgroundColor: colors.fill,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    padding: space.xl,
    borderColor: colors.rule,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  actions: { flexDirection: 'row', gap: space.sm },
  action: { flex: 1 },
}));
