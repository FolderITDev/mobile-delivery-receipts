import {
  ConflictError,
  base,
  choice,
  object,
  photo,
  text,
  timestamp,
  type BaseRecord,
  type Photo,
} from './validation';
export interface AppRecord extends BaseRecord {
  reference: string;
  destination: string;
  status: 'pending' | 'completed';
  recipient: string;
  note: string;
  photo: Photo | null;
  deliveredAt: string | null;
  timeZone: string | null;
}
export function createDelivery(
  id: string,
  reference: string,
  destination: string,
  now = new Date().toISOString(),
): AppRecord {
  return {
    id,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    reference: text(reference, 'Reference', 40),
    destination: text(destination, 'Destination', 100),
    status: 'pending',
    recipient: '',
    note: '',
    photo: null,
    deliveredAt: null,
    timeZone: null,
  };
}
export function completeDelivery(
  record: AppRecord,
  recipient: string,
  note: string,
  evidence: Photo | null,
  timeZone: string,
  now = new Date().toISOString(),
): AppRecord {
  if (record.status === 'completed')
    throw new ConflictError('This delivery has already been completed.');
  if (!evidence) throw new Error('Add a photo before confirming the delivery.');
  return {
    ...record,
    status: 'completed',
    recipient: text(recipient, 'Recipient name', 100),
    note: text(note, 'Note', 1000, true),
    photo: photo(evidence),
    deliveredAt: timestamp(now),
    timeZone: text(timeZone, 'Time zone', 100),
  };
}
export function parseRecord(value: unknown): AppRecord {
  const v = object(value);
  const r: AppRecord = {
    ...base(v),
    reference: text(v.reference, 'Reference', 40),
    destination: text(v.destination, 'Destination', 100),
    status: choice(v.status, ['pending', 'completed']),
    recipient: text(v.recipient, 'Recipient', 100, true),
    note: text(v.note, 'Note', 1000, true),
    photo: v.photo === null ? null : photo(v.photo),
    deliveredAt: v.deliveredAt === null ? null : timestamp(v.deliveredAt),
    timeZone: v.timeZone === null ? null : text(v.timeZone, 'Time zone', 100),
  };
  if (
    r.status === 'completed' &&
    (!r.recipient || !r.photo || !r.deliveredAt || !r.timeZone)
  )
    throw new Error('Incomplete delivery record.');
  return r;
}
/** Pending deliveries in route order: the oldest request first. */
export function pendingQueue(records: AppRecord[]): AppRecord[] {
  return records
    .filter((r) => r.status === 'pending')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Completed deliveries, the most recent handoff first. */
export function deliveredLog(records: AppRecord[]): AppRecord[] {
  return records
    .filter((r) => r.status === 'completed')
    .sort((a, b) => (b.deliveredAt ?? '').localeCompare(a.deliveredAt ?? ''));
}
export function photos(records: AppRecord[]): Photo[] {
  return records.flatMap((r) => (r.photo ? [r.photo] : []));
}
