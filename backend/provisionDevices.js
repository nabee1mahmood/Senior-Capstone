/**
 * Default demo devices per user. device_uid = `${userId}-${suffix}` (globally unique).
 */
export const DEFAULT_DEVICE_TEMPLATES = [
  ["Attic humidity node", "dev-attic-01"],
  ["Basement moisture", "dev-basement-01"],
  ["Kitchen appliance health", "dev-kitchen-01"]
]

export function deviceUidForUser(userId, uidSuffix) {
  return `${userId}-${uidSuffix}`
}

/**
 * Insert the three template devices for this user (idempotent per device_uid).
 */
export async function provisionDefaultDevices(query, userId) {
  for (const [name, suffix] of DEFAULT_DEVICE_TEMPLATES) {
    const deviceUid = deviceUidForUser(userId, suffix)
    await query(
      `INSERT INTO devices (user_id, name, device_uid)
       VALUES ($1, $2, $3)
       ON CONFLICT (device_uid) DO NOTHING`,
      [userId, name, deviceUid]
    )
  }
}

/**
 * True if user has at least one device.
 */
export async function userHasDevices(query, userId) {
  const { rows } = await query(
    "SELECT 1 AS ok FROM devices WHERE user_id = $1 LIMIT 1",
    [userId]
  )
  return rows.length > 0
}
