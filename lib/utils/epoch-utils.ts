export function dateSringToMillisSinceEpochInET(dateString: string): number {
  const date = new Date(dateString)
  const startOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )
  startOfDay.setHours(0)
  startOfDay.setMinutes(0)
  startOfDay.setSeconds(0)
  startOfDay.setMilliseconds(0)
  return startOfDay.getTime()
}

export function formatDateToEST(date: Date): string {
  const estOffsetInMinutes = -300 // Eastern Standard Time (EST) offset is UTC-5 hours = -300 minutes
  const edtOffsetInMinutes = -240 // Eastern Daylight Time (EDT) offset is UTC-4 hours = -240 minutes

  // Determine if the date is in Eastern Daylight Time (EDT) or Eastern Standard Time (EST)
  const isDST = isEasternDaylightTime(date)

  // Adjust the date to the appropriate offset (EDT or EST)
  date.setUTCMinutes(
    date.getUTCMinutes() + (isDST ? edtOffsetInMinutes : estOffsetInMinutes)
  )

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isEasternDaylightTime(date: Date): boolean {
  const year = date.getUTCFullYear()
  const marchDate = new Date(Date.UTC(year, 2, 8)) // March 8th (month is 0-indexed)
  const novemberDate = new Date(Date.UTC(year, 10, 1)) // November 1st (month is 0-indexed)

  // Calculate the start and end dates of Daylight Saving Time (second Sunday of March and first Sunday of November)
  const dstStart = new Date(marchDate.setDate(8 - marchDate.getUTCDay()))
  const dstEnd = new Date(
    novemberDate.setDate(1 - novemberDate.getUTCDay() + 7)
  )

  // Check if the date falls within the Daylight Saving Time range
  return date >= dstStart && date < dstEnd
}
