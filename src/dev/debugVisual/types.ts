import type { DevSpeedControlType } from '../../types/types';

export type DevSpeedHndlrType = (
  devSpeed: React.RefObject<DevSpeedControlType>,
  select: DevSpeedControlType
) => void;
