export interface StreetAddress {
	city?: string;
	state?: string;
	country?: string;
}

export interface ZipCode {
	zipCode?: string;
}

export interface GEOCODE {
	lat?: number;
	lon?: number;
}

export interface LocationInput extends StreetAddress, ZipCode, GEOCODE {
	timezone?: number;
}

export interface LocationOutput {
	zipCode: string;
	lat: number;
	lon: number;
	city: string;
	state: string;
	country: string;
	address: string;
}
