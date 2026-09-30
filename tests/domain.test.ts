import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDelivery,
  completeDelivery,
  deliveredLog,
  parseRecord,
  pendingQueue,
} from '../src/domain/model';
import { deliveries } from './fixtures';
const photo = { id: 'test', path: 'photo-test.jpg', width: 800, height: 600 };
test('a handoff requires recipient and photo and cannot be repeated', () => {
  const draft = createDelivery('test', 'PKG-1', 'North workshop');
  assert.throws(() => completeDelivery(draft, 'Alex', '', null, 'UTC'));
  assert.throws(() => completeDelivery(draft, ' ', '', photo, 'UTC'));
  const done = completeDelivery(
    draft,
    'Alex',
    'At front desk',
    photo,
    'UTC',
    '2026-09-30T12:00:00Z',
  );
  assert.equal(done.deliveredAt, '2026-09-30T12:00:00Z');
  assert.equal(done.timeZone, 'UTC');
  assert.equal(draft.status, 'pending');
  assert.deepEqual(parseRecord(done), done);
  assert.throws(
    () => completeDelivery(done, 'Someone else', '', photo, 'UTC'),
    /already/,
  );
});
test('corrupt completed records cannot load', () => {
  assert.throws(() =>
    parseRecord({
      ...createDelivery('test', 'PKG-1', 'Dock'),
      status: 'completed',
    }),
  );
});
test('pending deliveries keep route order; delivered ones show the latest first', () => {
  const photoA = { ...photo, id: 'a' };
  const [first, second, third] = deliveries(Date.parse('2026-09-30T12:00:00Z'));
  const done = completeDelivery(
    third,
    'Sam',
    '',
    photoA,
    'UTC',
    '2026-09-30T13:00:00Z',
  );
  const earlier = completeDelivery(
    second,
    'Kai',
    '',
    photoA,
    'UTC',
    '2026-09-30T12:30:00Z',
  );
  const records = [done, first, earlier];
  assert.deepEqual(
    pendingQueue(records).map((r) => r.reference),
    ['PKG-1048'],
  );
  assert.deepEqual(
    deliveredLog(records).map((r) => r.recipient),
    ['Sam', 'Kai'],
  );
  assert.ok(first.createdAt < second.createdAt);
});
