/**
 * Google Calendar API Client
 * Provides methods to interact with the Google Calendar API
 */

export interface CalendarEvent {
	id: string;
	summary: string;
	description?: string;
	location?: string;
	start: {
		dateTime: string;
		date: string;
		timeZone: string;
	};
	end: {
		dateTime: string;
		date: string;
		timeZone: string;
	};
	status?: "confirmed" | "tentative" | "cancelled";
	htmlLink?: string;
	creator?: {
		email?: string;
		displayName?: string;
	};
	organizer?: {
		email?: string;
		displayName?: string;
	};
	attendees?: Array<{
		email?: string;
		displayName?: string;
		responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
	}>;
}

export interface ListEventsOptions {
	/** Maximum number of events returned on one result page. Default: 250 */
	maxResults?: number;
	/** Token specifying which result page to return */
	pageToken?: string;
	/** Upper bound for an event's start time to filter by */
	timeMax?: string;
	/** Lower bound for an event's start time to filter by */
	timeMin?: string;
	/** Free text search terms to find events */
	q?: string;
	/** Whether to include deleted events. Default: false */
	showDeleted?: boolean;
	/** Whether to include hidden invitations. Default: false */
	showHiddenInvitations?: boolean;
	/** Whether to expand recurring events into instances. Default: false */
	singleEvents?: boolean;
	/** Order of events. Options: 'startTime', 'updated' */
	orderBy?: "startTime" | "updated";
}

export interface ListEventsResponse {
	items: CalendarEvent[];
	nextPageToken?: string;
	summary?: string;
	updated?: string;
}

export class GoogleCalendarClient {
	private apiKey: string;
	private baseUrl = "https://www.googleapis.com/calendar/v3";

	constructor(apiKey: string) {
		if (!apiKey) {
			throw new Error("Google Calendar API key is required");
		}
		this.apiKey = apiKey;
	}

	/**
	 * Lists events from a specified calendar
	 * @param calendarId - The calendar identifier (use 'primary' for the primary calendar)
	 * @param options - Optional parameters for filtering and pagination
	 * @returns Promise with list of calendar events
	 */
	async listEvents(
		calendarId: string,
		options: ListEventsOptions = {},
	): Promise<ListEventsResponse> {
		const params = new URLSearchParams({
			key: this.apiKey,
		});

		// Add optional parameters
		if (options.maxResults) {
			params.append("maxResults", options.maxResults.toString());
		}
		if (options.pageToken) {
			params.append("pageToken", options.pageToken);
		}
		if (options.timeMax) {
			params.append("timeMax", options.timeMax);
		}
		if (options.timeMin) {
			params.append("timeMin", options.timeMin);
		}
		if (options.q) {
			params.append("q", options.q);
		}
		if (options.showDeleted !== undefined) {
			params.append("showDeleted", options.showDeleted.toString());
		}
		if (options.showHiddenInvitations !== undefined) {
			params.append(
				"showHiddenInvitations",
				options.showHiddenInvitations.toString(),
			);
		}
		if (options.singleEvents !== undefined) {
			params.append("singleEvents", options.singleEvents.toString());
		}
		if (options.orderBy) {
			params.append("orderBy", options.orderBy);
		}

		const url = `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`;

		const response = await fetch(url);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				`Google Calendar API error: ${response.status} ${response.statusText}${
					errorData.error?.message ? ` - ${errorData.error.message}` : ""
				}`,
			);
		}

		const data = await response.json();

		return {
			items: data.items || [],
			nextPageToken: data.nextPageToken,
			summary: data.summary,
			updated: data.updated,
		};
	}

	/**
	 * Lists all events from a calendar, handling pagination automatically
	 * @param calendarId - The calendar identifier
	 * @param options - Optional parameters for filtering
	 * @returns Promise with all calendar events
	 */
	async listAllEvents(
		calendarId: string,
		options: Omit<ListEventsOptions, "pageToken"> = {},
	): Promise<CalendarEvent[]> {
		const allEvents: CalendarEvent[] = [];
		let pageToken: string | undefined;

		do {
			const response = await this.listEvents(calendarId, {
				...options,
				pageToken,
			});

			allEvents.push(...response.items);
			pageToken = response.nextPageToken;
		} while (pageToken);

		return allEvents;
	}
}
