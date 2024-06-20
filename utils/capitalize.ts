/**
 * capitalize
 * @param {string} str - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
export const capitalize = (str: string): string => {
	str = str.toLowerCase();
	return str.charAt(0).toUpperCase() + str.slice(1);
};
