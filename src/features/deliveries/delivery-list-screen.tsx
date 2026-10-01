import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/data/store';
import { deliveredLog, pendingQueue, type AppRecord } from '@/domain/model';
import { createStyles, space } from '@/theme';
import {
  Button,
  CONTENT_MAX_WIDTH,
  EmptyState,
  Footer,
  HeaderButton,
  SegmentedControl,
  Separator,
} from '@/ui';
import {
  DELIVERY_ROW_TEXT_INSET,
  DeliveryRow,
} from './components/delivery-row';

type Filter = 'pending' | 'delivered';

export function DeliveryListScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { records } = useStore();
  const [view, setView] = useState<Filter>('pending');
  const queue = useMemo(() => pendingQueue(records), [records]);
  const log = useMemo(() => deliveredLog(records), [records]);
  const data = view === 'pending' ? queue : log;
  // The empty log offers a way back to the queue, pinned like other screen actions.
  const showPendingAction =
    view === 'delivered' && !log.length && queue.length > 0;

  return (
    <>
      <Stack.Screen options={{ headerRight: () => <HeaderActions /> }} />
      <FlatList
        data={data}
        keyExtractor={(record) => record.id}
        contentInsetAdjustmentBehavior="automatic"
        style={styles.list}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: showPendingAction
              ? space.xl
              : insets.bottom + space.xxl,
          },
          !data.length && styles.contentEmpty,
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <SegmentedControl
              accessibilityLabel="Delivery status"
              value={view}
              onChange={setView}
              segments={[
                { value: 'pending', label: 'To deliver', count: queue.length },
                { value: 'delivered', label: 'Delivered', count: log.length },
              ]}
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <DeliveryRow
            record={item}
            index={index}
            onPress={() => openDelivery(item)}
          />
        )}
        ItemSeparatorComponent={RowSeparator}
        ListEmptyComponent={
          view === 'pending' ? (
            <EmptyQueue hasHistory={log.length > 0} />
          ) : (
            <EmptyLog />
          )
        }
      />
      {showPendingAction && (
        <Footer>
          <Button
            label={`Show ${queue.length} to deliver`}
            variant="secondary"
            onPress={() => setView('pending')}
          />
        </Footer>
      )}
    </>
  );
}

function openDelivery(record: AppRecord) {
  router.push({ pathname: '/delivery/[id]', params: { id: record.id } });
}

function HeaderActions() {
  const styles = useStyles();
  return (
    <View style={styles.headerActions}>
      <HeaderButton
        icon="info"
        accessibilityLabel="About Delivery Receipts"
        onPress={() => router.push('/about')}
      />
      <HeaderButton
        icon="add"
        accessibilityLabel="New delivery"
        onPress={() => router.push('/new')}
      />
    </View>
  );
}

function RowSeparator() {
  return <Separator inset={DELIVERY_ROW_TEXT_INSET} />;
}

function EmptyLog() {
  return (
    <EmptyState
      centered
      icon="delivered"
      title="No handoffs yet"
      body="Deliveries you confirm appear here with their receipt."
    />
  );
}

function EmptyQueue({ hasHistory }: { hasHistory: boolean }) {
  if (hasHistory)
    return (
      <EmptyState
        icon="package"
        title="All delivered"
        body="Every delivery on this device has a recorded handoff."
      >
        <Button
          label="New delivery"
          icon="add"
          onPress={() => router.push('/new')}
        />
      </EmptyState>
    );
  return (
    <EmptyState
      icon="package"
      title="No deliveries yet"
      body="Create a delivery, then record who received it with a photo."
    >
      <Button
        label="New delivery"
        icon="add"
        onPress={() => router.push('/new')}
      />
    </EmptyState>
  );
}

const useStyles = createStyles(({ colors }) => ({
  list: { flex: 1, backgroundColor: colors.canvas },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: space.gutter,
    paddingTop: space.sm,
    paddingBottom: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  contentEmpty: { flexGrow: 1 },
}));
