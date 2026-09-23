import React from 'react';
import cn from 'classnames';

type Props = {
  isAllDone: boolean;
  isExist: boolean;
  onToggle: () => void;
};

export const ToggleAll: React.FC<Props> = ({ isAllDone, isExist, onToggle }) =>
  isExist && (
    <button
      type="button"
      className={cn('todoapp__toggle-all', {
        active: isAllDone,
      })}
      onClick={onToggle}
      data-cy="ToggleAllButton"
    />
  );
