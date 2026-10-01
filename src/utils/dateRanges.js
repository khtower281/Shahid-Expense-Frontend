import { toInputDate } from './formatters';

/**
 * Compute [startDate, endDate] for a preset key.
 * Returns YYYY-MM-DD strings ('' means unbounded).
 */
export const computeRange = (key) => {
  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);

  if (key === '7d') {
    start.setDate(today.getDate() - 6);
  } else if (key === '30d') {
    start.setDate(today.getDate() - 29);
  } else if (key === 'month') {
    start.setDate(1);
  } else if (key === 'year') {
    start.setMonth(0);
    start.setDate(1);
  } else {
    return { startDate: '', endDate: '' };
  }

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(end)
  };
};