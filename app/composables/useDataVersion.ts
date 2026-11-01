import { useEffect, useState } from 'react';

const DATA_CHANGED_EVENT = 'public_sector_data_changed';

/** Tells every open list that something changed. Called after any successful save. */
export const announceDataChanged = () => {
 if (typeof window !== 'undefined') window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
};

/**
 * Add this to the dependencies of the effect that loads a list. The effect already
 * knows the current page and filters, so a change reloads exactly what is on screen.
 */
export const useDataVersion = () => {
 const [version, setVersion] = useState(0);

 useEffect(() => {
  const bump = () => setVersion((current) => current + 1);
  window.addEventListener(DATA_CHANGED_EVENT, bump);
  return () => window.removeEventListener(DATA_CHANGED_EVENT, bump);
 }, []);

 return version;
};
