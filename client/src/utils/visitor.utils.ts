/**
 * Retrieves or generates a persistent visitor identifier stored in localStorage.
 * Used for invite link analytics and duplicate click filtering.
 */
export const getVisitorIdentifier = (): string => {
  const STORAGE_KEY = 'gatherpulse_visitor_id';
  let visitorId = localStorage.getItem(STORAGE_KEY);
  if (!visitorId) {
    visitorId = 'vis_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, visitorId);
  }
  return visitorId;
};
