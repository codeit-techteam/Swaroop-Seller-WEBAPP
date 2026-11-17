export const SAMPLE_ADMIN_PUSH_IDS = new Set([
  "PSH-2401",
  "PSH-2402",
  "PSH-2403",
  "PSH-2404",
  "PSH-2405",
  "PSH-2406",
  "PSH-2407",
  "PSH-2408",
]);

const SAMPLE_TITLE =
  /monsoon bulk rates|gst invoices for august|navratri procurement window opens 22 sept/i;

export function isSampleAdminPush(item: {
  id?: string;
  title?: string;
}): boolean {
  if (item.id && SAMPLE_ADMIN_PUSH_IDS.has(item.id)) return true;
  return SAMPLE_TITLE.test(item.title ?? "");
}
