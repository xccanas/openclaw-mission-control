"use client";

import { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { Id } from "../convex/_generated/dataModel";
import Header from "./components/Header";
import AgentsSidebar from "./components/AgentsSidebar";
import MissionQueue from "./components/MissionQueue";
import LiveFeed from "./components/LiveFeed";
import SignInForm from "./components/SignIn";
import TaskDetailPanel from "./components/TaskDetailPanel";

export default function App() {
	const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);

	return (
		<>
			<Authenticated>
				<main className="app-container relative">
					<Header />
					<AgentsSidebar />
					<MissionQueue 
						selectedTaskId={selectedTaskId} 
						onSelectTask={setSelectedTaskId} 
					/>
					<LiveFeed />
					
					{/* Detail Panel */}
					{selectedTaskId && (
						<TaskDetailPanel 
							taskId={selectedTaskId} 
							onClose={() => setSelectedTaskId(null)} 
						/>
					)}
				</main>
			</Authenticated>
			<Unauthenticated>
				<SignInForm />
			</Unauthenticated>
		</>
	);
}
