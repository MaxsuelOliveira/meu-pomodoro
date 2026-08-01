import dayjs from 'dayjs';

export const nowIso = () => new Date().toISOString();

export const startOfTodayIso = () => dayjs().startOf('day').toISOString();

export const endOfTodayIso = () => dayjs().endOf('day').toISOString();

export const formatShortDateTime = (iso: string) => dayjs(iso).format('DD/MM HH:mm');

export const formatDayLabel = (iso: string) => dayjs(iso).format('DD/MM');
