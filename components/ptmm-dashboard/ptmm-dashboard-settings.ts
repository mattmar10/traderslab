export interface PTMMDashboardSettings {
  show5SMA: boolean;
  show10EMA: boolean;
  show21EMA: boolean;
  show50SMA: boolean;
  show200SMA: boolean;
}
export const defaultPTMMDashboardSettings: PTMMDashboardSettings = {
  show5SMA: true,
  show10EMA: true,
  show21EMA: true,
  show50SMA: true,
  show200SMA: true,
};
