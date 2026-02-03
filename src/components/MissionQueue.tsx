import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const columns = [
	{ id: "inbox", label: "INBOX", color: "var(--text-subtle)" },
	{ id: "assigned", label: "ASSIGNED", color: "var(--accent-orange)" },
	{ id: "in_progress", label: "IN PROGRESS", color: "var(--accent-blue)" },
	{ id: "review", label: "REVIEW", color: "var(--text-main)" },
	{ id: "done", label: "DONE", color: "var(--accent-green)" },
];

interface MissionQueueProps {
	selectedTaskId: Id<"tasks"> | null;
	onSelectTask: (id: Id<"tasks">) => void;
}

const MissionQueue: React.FC<MissionQueueProps> = ({ selectedTaskId, onSelectTask }) => {
	const tasks = useQuery(api.queries.listTasks);
	const agents = useQuery(api.queries.listAgents);

	if (tasks === undefined || agents === undefined) {
		return (
			<main className="[grid-area:main] bg-secondary flex flex-col overflow-hidden animate-pulse">
				<div className="h-[65px] bg-white border-b border-border" />
				<div className="flex-1 grid grid-cols-5 gap-px bg-border">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="bg-secondary" />
					))}
				</div>
			</main>
		);
	}

	const getAgentName = (id: string) => {
		return agents.find((a) => a._id === id)?.name || "Unknown";
	};

	return (
		<main className="[grid-area:main] bg-secondary flex flex-col overflow-hidden">
			<div className="flex items-center justify-between px-6 py-5 bg-white border-b border-border">
				<div className="text-[11px] font-bold tracking-widest text-muted-foreground flex items-center gap-2">
					<span className="w-1.5 h-1.5 bg-[var(--accent-orange)] rounded-full" />{" "}
					MISSION QUEUE
				</div>
				<div className="flex gap-2">
					<div className="text-[11px] font-semibold px-3 py-1 rounded bg-muted text-muted-foreground flex items-center gap-1.5">
						<span className="text-sm">📦</span>{" "}
						{tasks.filter((t) => t.status === "inbox").length}
					</div>
					<div className="text-[11px] font-semibold px-3 py-1 rounded bg-[#f0f0f0] text-[#999]">
						{tasks.filter((t) => t.status !== "done").length} active
					</div>
				</div>
			</div>

			<div className="flex-1 grid grid-cols-5 gap-px bg-border overflow-x-auto">
				{columns.map((col) => (
					<div
						key={col.id}
						className="bg-secondary flex flex-col min-w-[250px]"
					>
						<div className="flex items-center gap-2 px-4 py-3 bg-[#f8f9fa] border-b border-border">
							<span
								className="w-2 h-2 rounded-full"
								style={{ backgroundColor: col.color }}
							/>
							<span className="text-[10px] font-bold text-muted-foreground flex-1 uppercase tracking-tighter">
								{col.label}
							</span>
							<span className="text-[10px] text-muted-foreground bg-border px-1.5 py-0.25 rounded-full">
								{tasks.filter((t) => t.status === col.id).length}
							</span>
						</div>
						<div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto">
							{tasks
								.filter((t) => t.status === col.id)
								.map((task) => {
									const isSelected = selectedTaskId === task._id;
									return (
										<div
											key={task._id}
											onClick={() => onSelectTask(task._id)}
											className={`bg-white rounded-lg p-4 shadow-sm flex flex-col gap-3 border transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
												isSelected 
													? "ring-2 ring-[var(--accent-blue)] border-transparent" 
													: "border-border"
											}`}
											style={{
												borderLeft: isSelected ? undefined : `4px solid ${task.borderColor || "transparent"}`,
											}}
										>
											<div className="flex justify-between text-muted-foreground text-sm">
												<span className="text-base">↑</span>
												<span className="tracking-widest">...</span>
											</div>
											<h3 className="text-sm font-semibold text-foreground leading-tight">
												{task.title}
											</h3>
											<p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
												{task.description}
											</p>
											<div className="flex justify-between items-center mt-1">
												{task.assigneeIds && task.assigneeIds.length > 0 && (
													<div className="flex items-center gap-1.5">
														<span className="text-xs">👤</span>
														<span className="text-[11px] font-semibold text-foreground">
															{getAgentName(task.assigneeIds[0] as string)}
														</span>
													</div>
												)}
												<span className="text-[11px] text-muted-foreground">
													just now
												</span>
											</div>
											<div className="flex flex-wrap gap-1.5">
												{task.tags.map((tag) => (
													<span
														key={tag}
														className="text-[10px] px-2 py-0.5 bg-muted rounded font-medium text-muted-foreground"
													>
														{tag}
													</span>
												))}
											</div>
										</div>
									);
								})}
						</div>
					</div>
				))}
			</div>
		</main>
	);
};

export default MissionQueue;
