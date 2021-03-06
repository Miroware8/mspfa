export const monthNames = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
] as const;

/** Outputs a string which is exactly two digits of the input. */
const twoDigits = (value: any) => `0${value}`.slice(-2);

/**
 * Gets the time from a `Date`.
 *
 * Example outputs: `'02:49'`, `'18:03'`
 */
export const getTime = (date: Date) => [
	date.getHours(),
	date.getMinutes()
].map(twoDigits).join(':');

/**
 * Gets an absolute timestamp from a `Date`.
 *
 * Example outputs: `'February 4, 2021'`, `'July 15, 1999 at 04:53'`
 */
export const getAbsoluteTimestamp = (date: Date, withTime?: boolean) => {
	let timestamp = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

	if (withTime) {
		timestamp += ` at ${getTime(date)}`;
	}

	return timestamp;
};

/**
 * Gets a short timestamp from a `Date`.
 *
 * Example outputs: `'02/04/21'`, `'07/15/99 04:53'`
 */
export const getShortTimestamp = (date: Date, withTime?: boolean) => {
	let timestamp = [
		date.getMonth() + 1,
		date.getDate(),
		date.getFullYear()
	].map(twoDigits).join('/');

	if (withTime) {
		timestamp += ` ${getTime(date)}`;
	}

	return timestamp;
};

/**
 * Gets a relative timestamp from a `Date`.
 *
 * Example outputs: `'14 minutes ago'`, `'3 years, 1 month ago'`, `'Just now!'`
 */
export const getRelativeTimestamp = (dateThen: Date) => {
	const then = +dateThen;
	const dateNow = new Date();
	const now = +dateNow;

	const secondsAgo = Math.floor((now - then) / 1000);

	if (secondsAgo <= 5) {
		return 'Just now!';
	}

	if (secondsAgo < 60) {
		return `${secondsAgo} seconds ago`;
	}

	const minutesAgo = Math.floor(secondsAgo / 60);

	if (minutesAgo < 60) {
		return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
	}

	const hoursAgo = Math.floor(minutesAgo / 60);

	if (hoursAgo < 24) {
		return `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`;
	}

	const daysAgo = Math.floor(hoursAgo / 24);

	if (daysAgo < 7) {
		return `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;
	}

	const fullYearNow = dateNow.getFullYear();
	const fullYearThen = dateThen.getFullYear();
	const monthNow = dateNow.getMonth();
	const monthThen = dateThen.getMonth();
	const fullMonthNow = 12 * fullYearNow + monthNow;
	const fullMonthThen = 12 * fullYearThen + monthThen;
	const monthsAgo = fullMonthNow - fullMonthThen + (
		dateNow.getDate() < dateThen.getDate()
			// If the day of the month now is lower than the day of the month then, the difference in months is one too high.
			? -1
			: 0
	);

	if (monthsAgo < 1) {
		const weeksAgo = Math.floor(daysAgo / 7);

		return `${weeksAgo} week${weeksAgo === 1 ? '' : 's'} ago`;
	}

	if (monthsAgo < 12) {
		return `${monthsAgo} month${monthsAgo === 1 ? '' : 's'} ago`;
	}

	const yearsAgo = fullYearNow - fullYearThen + (
		monthNow < monthThen
			// If the month of the year now is lower than the month of the year then, the difference in years is one too high.
			? -1
			: 0
	);
	const moreMonthsAgo = monthsAgo - 12 * yearsAgo;

	return `${yearsAgo} year${yearsAgo === 1 ? '' : 's'}${moreMonthsAgo ? `, ${moreMonthsAgo} month${moreMonthsAgo === 1 ? '' : 's'}` : ''} ago`;
};