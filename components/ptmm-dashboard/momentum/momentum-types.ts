export type STMomentumRow = {
  dateStr: string
  upFourPercent: number
  downFourPercent: number
  dayRatio: number
  fiveDayRatio: number
  tenDayRatio: number
  dailyMomo: number
}

export type MTLTMomentumRow = {
  dateStr: string
  upTwentyFivePercent: number
  downTwentyFivePercent: number
  ratio: number
}

export type MomentumRow = {
  stMomentumRow: STMomentumRow
  mtMomentumRow: MTLTMomentumRow
  ltMomentumRow: MTLTMomentumRow
}

export type UpAndDown = {
  dateStr: string
  upCount: number
  downCount: number
}
