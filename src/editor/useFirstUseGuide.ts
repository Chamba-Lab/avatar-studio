import { useState } from 'react';

const STORAGE_KEY = 'avatar-studio:guide-seen';

/** Whether to show the first-use guide: once per browser, remembered after it is dismissed. */
export function useFirstUseGuide() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== '1';
    } catch {
      // Storage can be blocked (private modes, in-app browsers): show it, just don't remember.
      return true;
    }
  });
  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* not remembered, shown again next time */
    }
  };
  return { open, dismiss };
}
