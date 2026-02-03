import React, { useState, useEffect } from "react";
import SignOutButton from "./Signout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const Header: React.FC = () => {
	const [time, setTime] = useState(new Date());
	
	// Fetch data for dynamic counts
	const agents = useQuery(api.queries.listAgents);
	const tasks = useQuery(api.queries.listTasks);

	// Calculate counts
	const activeAgentsCount = agents ? agents.filter(a => a.status === "active").length : 0;
	const tasksInQueueCount = tasks ? tasks.filter(t => t.status !== "done").length : 0;

	useEffect(() => {
		const timer = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	const formatDate = (date: Date) => {
		return date
			.toLocaleDateString("en-US", {
				weekday: "short",
				month: "short",
				day: "numeric",
			})
			.toUpperCase();
	};

	return (
		<header className="[grid-area:header] flex items-center justify-between px-6 bg-white border-b border-border z-10">
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<span className="text-2xl text-[var(--accent-orange)]">◇</span>
					<h1 className="text-lg font-semibold tracking-wider text-foreground">
						MISSION CONTROL
					</h1>
				</div>
				<div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
					SiteName
				</div>
			</div>

			<div className="flex items-center gap-10">
				<div className="flex flex-col items-center">
					<div className="text-2xl font-bold text-foreground">
						{agents ? activeAgentsCount : "-"}
					</div>
					<div className="text-[10px] font-semibold text-muted-foreground tracking-tighter">
						AGENTS ACTIVE
					</div>
				</div>
				<div className="w-px h-8 bg-border" />
				<div className="flex flex-col items-center">
					<div className="text-2xl font-bold text-foreground">
						{tasks ? tasksInQueueCount : "-"}
					</div>
					<div className="text-[10px] font-semibold text-muted-foreground tracking-tighter">
						TASKS IN QUEUE
					</div>
				</div>
			</div>

			<div className="flex items-center gap-6">
				<button className="flex items-center gap-1.5 bg-muted hover:bg-accent border-none px-4 py-2 rounded-lg text-sm font-medium cursor-pointer text-foreground transition-colors">
					<span className="text-base">📚</span> Docs
				</button>
				<div className="text-right">
					<div className="text-xl font-semibold text-foreground tabular-nums">
						{formatTime(time)}
					</div>
					<div className="text-[10px] font-medium text-muted-foreground tracking-[0.5px]">
						{formatDate(time)}
					</div>
				</div>
				<div className="flex items-center gap-2 bg-[#e6fcf5] text-[#0ca678] px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.5px]">
					<span className="w-2 h-2 bg-[#0ca678] rounded-full" />
					ONLINE
				</div>
				<SignOutButton />
			</div>
		</header>
	);
};

export default Header;
