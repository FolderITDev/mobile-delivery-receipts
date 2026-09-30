import { createDelivery, type AppRecord } from '../src/domain/model';

/** Three deliveries created a minute apart so their route order is stable. */
export function deliveries(now = Date.now()): AppRecord[] {
  return [
    ['PKG-1048', 'North workshop · Loading bay'],
    ['PKG-1049', 'South studio · Front desk'],
    ['PKG-1050', 'West annex · Reception'],
  ].map(([reference, destination], i, all) =>
    createDelivery(
      `delivery-${i}`,
      reference,
      destination,
      new Date(now - (all.length - i) * 60_000).toISOString(),
    ),
  );
}
