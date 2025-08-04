import type { DevSpeedControlType } from '../../../../types/types';
import type { DevSpeedHndlrType } from '../../types';

export const selectJSX = (
  label: string,
  name: string,
  opts: string[],
  devSpeedHndlr: DevSpeedHndlrType,
  devSpeed,
  DebugVisualCss
) => {
  return (
    <div>
      <label htmlFor={name} className={DebugVisualCss.selectLabel}>
        {label}:
      </label>
      <select
        onChange={(e) => devSpeedHndlr(devSpeed, e.target.value as DevSpeedControlType)}
        id={name}
        className={DebugVisualCss.select}
        name={name}
      >
        {opts.map((opt, i) => {
          return (
            <option key={opt + i} value={opt}>
              {opt}
            </option>
          );
        })}
      </select>
    </div>
  );
};
