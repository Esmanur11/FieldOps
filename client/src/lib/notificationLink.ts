// Routes a notification to the page for the entity it's about. Distinct from WorkOrder's own
// sourceType taxonomy ("audit_finding"/"maintenance_prediction"/"low_stock", the trigger kind) —
// relatedEntityType here names the target entity kind instead ("audit"/"machine"/"material").
export function notificationLink(relatedEntityType: string | null, relatedEntityId: number | null): string | null {
  if (relatedEntityId === null) return null;
  if (relatedEntityType === "audit") return `/audits/${relatedEntityId}`;
  if (relatedEntityType === "machine") return `/machines/${relatedEntityId}`;
  if (relatedEntityType === "material") return "/materials";
  return null;
}
