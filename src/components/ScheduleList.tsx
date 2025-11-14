import {
	type CalendarEvent,
	GoogleCalendarClient,
} from "@/api/google-calendar";
import { useEffect, useState } from "preact/hooks";

const GOOGLE_CALENDAR_API_KEY = "AIzaSyBdhOr5rVmDeE3k3jTXsxKOEeboWZDZ0Pc";
const GOOGLE_CALENDAR_ID =
	"66f9e61d23f9983ef49303ec9d123bebc72ce07031d3ec8e38985a457490194c@group.calendar.google.com";

export type Show = {
	title: string;
	description?: string;
	startTime: Date;
	endTime: Date;
};

export type ShowCardProps = {
	show: Show;
};

function ShowCard({ show }: ShowCardProps) {
	const isActive =
		show.startTime.getTime() <= Date.now() &&
		show.endTime.getTime() >= Date.now();

	return (
		<div
			class={`rounded-lg border-2 p-4 transition-all ${
				isActive
					? "border-[#db5439] bg-[#db5439] text-white shadow-lg"
					: "border-neutral-200 bg-white"
			}`}
		>
			<div class="mb-2 flex items-center gap-3">
				<span
					class={`text-sm font-semibold ${isActive ? "text-white" : "text-[#db5439]"}`}
				>
					{show.startTime.getDay() != new Date().getDay() && (
						<>
							{show.startTime.toLocaleString("en", { weekday: "long" })}
							{" @ "}
						</>
					)}
					{show.startTime.toLocaleTimeString("en-US", {
						hour: "numeric",
						minute: "2-digit",
						hour12: true,
					})}{" "}
					-{" "}
					{show.endTime.toLocaleTimeString("en-US", {
						hour: "numeric",
						minute: "2-digit",
						hour12: true,
					})}
				</span>
				{isActive && (
					<span class="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#db5439] uppercase">
						On Air
					</span>
				)}
			</div>
			<h3
				class={`mb-1 text-xl font-bold ${isActive ? "text-white" : "text-neutral-900"}`}
			>
				{show.title}
			</h3>
			<p class={`text-sm ${isActive ? "text-white/90" : "text-neutral-600"}`}>
				{show.description}
			</p>
		</div>
	);
}

const googleCalendarClient = new GoogleCalendarClient(GOOGLE_CALENDAR_API_KEY);

export function ScheduleList() {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<CalendarEvent[] | null>();

	useEffect(() => {
		googleCalendarClient
			.listAllEvents(GOOGLE_CALENDAR_ID, {
				timeMin: new Date().toISOString(),
				timeMax: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				orderBy: "startTime",
				singleEvents: true,
			})
			.then((events) => {
				setIsLoading(false);
				setData(events);
			})
			.catch((e) => {
				setIsLoading(false);
				setError(e.message ?? "An error occurred");
			});
	}, []);

	return (
		<div class="flex flex-col gap-3">
			{isLoading && (
				<>
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							class="animate-pulse rounded-lg border-2 border-neutral-200 bg-white p-4"
						>
							<div class="mb-2 h-5 w-48 rounded bg-neutral-200" />
							<div class="mb-1 h-6 w-64 rounded bg-neutral-200" />
							<div class="h-4 w-full rounded bg-neutral-200" />
							<div class="mt-1 h-4 w-3/4 rounded bg-neutral-200" />
						</div>
					))}
				</>
			)}

			{error && (
				<div class="font-bold text-red-800">Failed to load schedule</div>
			)}

			{data?.slice(0, 5).map((event) => {
				const show: Show = {
					title: event.summary,
					description: event.description,
					startTime: new Date(event.start.dateTime),
					endTime: new Date(event.end.dateTime),
				};
				return <ShowCard show={show} />;
			})}
		</div>
	);
}
