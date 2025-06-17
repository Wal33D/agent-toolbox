export function parseQueryParams<T = Record<string, any>>(query: Record<string, string | string[] | undefined>): T {
        const parsedQuery: Record<string, any> = {};

	Object.keys(query).forEach(key => {
		const value = query[key];
		if (typeof value === 'string') {
			parsedQuery[key] = isNaN(Number(value)) ? value : parseFloat(value);
		} else {
			parsedQuery[key] = value;
		}
	});
        return parsedQuery as T;
}
