export interface ApiResponse {
	status: boolean;
	message: string;
	data: SearchResult[];
}

export interface SearchResult {
	searchQuery: string;
	pagination: Pagination;
	organic_results: OrganicResult[];
	engine_url: string;
	json_url: string;
}

export interface Pagination {
	pages: Page[];
}

export interface Page {
	current: number;
	next: string;
	other_pages: OtherPage[];
	api_pagination: ApiPagination;
}

export interface OtherPage {
	page: number;
	link: string;
}

export interface ApiPagination {
	next: string;
	other_pages: ApiOtherPage[];
}

export interface ApiOtherPage {
	page: number;
	link: string;
}

export interface OrganicResult {
	position: number;
	title: string;
	link: string;
	domain: string;
	displayed_link: string;
	snippet: string;
	prerender: boolean;
	block_position: number;
	page: number;
	position_overall: number;
	rich_snippet?: RichSnippet;
}

export interface RichSnippet {
	top: {
		detected_extensions: DetectedExtensions;
		extensions: string[];
	};
}

export interface DetectedExtensions {
	rating: number;
	reviews: number;
}

export interface SerpSearchRequest {
	searchTerm: string;
	location?: string;
	hostLanguage?: string;
	geolocation?: string;
	device?: string;
	numberOfResults?: string;
	max_page?: string;
	include_html?: string;
	include_answer_box?: string;
	time_period?: string;
	output?: string;
}
export interface ImageSearchOptions {
	searchTerm: string;
	queryStringAddition?: string;
	filterOutDomains?: string[];
	size?: string;
}

export interface ImageResult {
	url: string;
	width: number;
	height: number;
}
