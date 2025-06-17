export const parseQueryParams = (query: any): any => {
	const parsedQuery: any = {};

	Object.keys(query).forEach(key => {
		const value = query[key];
		if (typeof value === 'string') {
			parsedQuery[key] = isNaN(Number(value)) ? value : parseFloat(value);
		} else {
			parsedQuery[key] = value;
		}
	});
	return parsedQuery;
};
