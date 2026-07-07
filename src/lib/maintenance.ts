/**
 * Maintenance mode.
 *
 * Flip MAINTENANCE_MODE to `true` and deploy to show every signed-in user an
 * "under maintenance" screen while changes are being rolled out; set it back to
 * `false` (deployed with the finished changes) to reopen the app.
 *
 * It can also be toggled from Vercel without a code change by setting the
 * environment variable NEXT_PUBLIC_MAINTENANCE_MODE to "true" (then redeploy).
 */
export const MAINTENANCE_MODE = true;

export const MAINTENANCE_MESSAGE =
  "KasuwaAI is under maintenance while we roll out improvements. We'll be back shortly — please check again in a few minutes.";

export function isMaintenanceMode(): boolean {
  return MAINTENANCE_MODE || process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
}
