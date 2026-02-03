import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { IconX, IconCheck, IconUser, IconTag, IconMessage, IconClock, IconFileText, IconCopy, IconCalendar } from "@tabler/icons-react";

interface TaskDetailPanelProps {
  taskId: Id<"tasks"> | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  inbox: "var(--text-subtle)",
  assigned: "var(--accent-orange)",
  in_progress: "var(--accent-blue)",
  review: "var(--text-main)",
  done: "var(--accent-green)",
};

const statusLabels: Record<string, string> = {
  inbox: "INBOX",
  assigned: "ASSIGNED",
  in_progress: "IN PROGRESS",
  review: "REVIEW",
  done: "DONE",
};

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ taskId, onClose }) => {
  const tasks = useQuery(api.queries.listTasks);
  const agents = useQuery(api.queries.listAgents);
  const resources = useQuery(api.documents.listByTask, taskId ? { taskId } : "skip");
  const activities = useQuery(api.queries.listActivities, taskId ? { taskId } : "skip");
  const messages = useQuery(api.queries.listMessages, taskId ? { taskId } : "skip");

  const updateStatus = useMutation(api.tasks.updateStatus);
  const updateAssignees = useMutation(api.tasks.updateAssignees);
  const updateTask = useMutation(api.tasks.updateTask);

  const task = tasks?.find((t) => t._id === taskId);
  const currentUserAgent = agents?.find(a => a.name === "Manish");
  
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  useEffect(() => {
    if (task) {
      setDescription(task.description);
    }
  }, [task]);

  if (!taskId) return null;
  if (!task) return null; // Loading or not found

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (currentUserAgent) {
        updateStatus({ taskId: task._id, status: e.target.value as any, agentId: currentUserAgent._id });
    }
  };

  const handleAssigneeToggle = (agentId: Id<"agents">) => {
    if (!currentUserAgent) return;
    const currentAssignees = task.assigneeIds || [];
    const isAssigned = currentAssignees.includes(agentId);
    
    let newAssignees;
    if (isAssigned) {
      newAssignees = currentAssignees.filter(id => id !== agentId);
    } else {
      newAssignees = [...currentAssignees, agentId];
    }
    updateAssignees({ taskId: task._id, assigneeIds: newAssignees, agentId: currentUserAgent._id });
  };

  const saveDescription = () => {
    if (currentUserAgent) {
        updateTask({ taskId: task._id, description, agentId: currentUserAgent._id });
        setIsEditingDesc(false);
    }
  };

  const renderAvatar = (avatar?: string) => {
    if (!avatar) return <IconUser size={10} />;
    const isUrl = avatar.startsWith("http") || avatar.startsWith("data:");
    if (isUrl) {
      return <img src={avatar} className="w-full h-full object-cover" alt="avatar" />;
    }
    return <span className="text-[10px] flex items-center justify-center h-full w-full leading-none">{avatar}</span>;
  };

  const formatCreationDate = (ms: number) => {
    return new Date(ms).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const lastUpdatedActivity = activities?.[0];
  const lastUpdated = lastUpdatedActivity ? lastUpdatedActivity._creationTime : null;

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-white border-l border-border shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#f8f9fa]">
        <div className="flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColors[task.status] || "gray" }}
          />
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {task._id.slice(-6)}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors"
        >
          <IconX size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold text-foreground leading-tight mb-2">
            {task.title}
          </h2>
          <div className="flex gap-2 mb-4">
            {task.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-muted rounded font-medium text-muted-foreground flex items-center gap-1">
                <IconTag size={10} /> {tag}
              </span>
            ))}
          </div>
          
          {/* Quick Action: Mark as Done */}
          {task.status !== 'done' && (
            <button
                onClick={() => currentUserAgent && updateStatus({ taskId: task._id, status: 'done', agentId: currentUserAgent._id })}
                disabled={!currentUserAgent}
                className={`w-full py-2 bg-[var(--accent-green)] text-white rounded text-sm font-medium flex items-center justify-center gap-2 transition-opacity shadow-sm ${!currentUserAgent ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                title={!currentUserAgent ? "User agent not found" : "Mark as Done"}
            >
                <IconCheck size={16} />
                Mark as Done
            </button>
          )}
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</label>
          <select 
            value={task.status}
            onChange={handleStatusChange}
            disabled={!currentUserAgent}
            className="w-full p-2 text-sm border border-border rounded bg-secondary text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] disabled:opacity-50"
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1 group">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>
            {!isEditingDesc && currentUserAgent && (
              <button 
                onClick={() => setIsEditingDesc(true)}
                className="text-[10px] text-[var(--accent-blue)] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Edit
              </button>
            )}
          </div>
          
          {isEditingDesc ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[100px] p-3 text-sm border border-border rounded bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setIsEditingDesc(false)}
                  className="px-3 py-1 text-xs text-muted-foreground hover:bg-muted rounded"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveDescription}
                  className="px-3 py-1 text-xs bg-foreground text-secondary rounded hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          )}
        </div>

        {/* Assignees */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Assignees</label>
          <div className="flex flex-wrap gap-2">
            {task.assigneeIds?.map(id => {
              const agent = agents?.find(a => a._id === id);
              return (
                <div key={id} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-border rounded-full shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                     {renderAvatar(agent?.avatar)}
                  </div>
                  <span className="text-xs font-medium text-foreground">{agent?.name || "Unknown"}</span>
                  <button 
                    onClick={() => handleAssigneeToggle(id)} 
                    disabled={!currentUserAgent}
                    className="hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <IconX size={12} />
                  </button>
                </div>
              );
            })}
            <div className="relative group">
              <button 
                disabled={!currentUserAgent}
                className="flex items-center gap-1 px-2 py-1 bg-muted border border-transparent rounded-full text-xs text-muted-foreground hover:bg-white hover:border-border transition-all disabled:opacity-50"
              >
                <span>+ Add</span>
              </button>
              
              {/* Dropdown for adding agents - simplified for now */}
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-border shadow-lg rounded-lg hidden group-hover:block z-10 p-1">
                 {agents?.filter(a => !task.assigneeIds?.includes(a._id)).map(agent => (
                   <button 
                    key={agent._id}
                    onClick={() => handleAssigneeToggle(agent._id)}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-muted rounded flex items-center gap-2"
                   >
                     <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {renderAvatar(agent.avatar)}
                     </div>
                     {agent.name}
                   </button>
                 ))}
                 {agents?.filter(a => !task.assigneeIds?.includes(a._id)).length === 0 && (
                   <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">No available agents</div>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Resources / Deliverables */}
        {resources && resources.length > 0 && (
            <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Resources / Deliverables</label>
                <div className="space-y-1">
                    {resources.map((doc) => (
                        <div key={doc._id} className="flex items-center justify-between p-2 bg-white border border-border rounded text-sm hover:bg-muted transition-colors cursor-pointer">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <IconFileText size={14} className="text-muted-foreground shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="truncate text-foreground font-medium">{doc.title}</span>
                                    {doc.path && <span className="text-[10px] text-muted-foreground truncate font-mono">{doc.path}</span>}
                                </div>
                            </div>
                            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground uppercase self-start mt-0.5">{doc.type}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

         {/* Meta */}
         <div className="mt-auto pt-6 border-t border-border flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <IconClock size={12} />
                    <span>Created {formatCreationDate(task._creationTime)}</span>
                </div>
                {lastUpdated && (
                    <div className="flex items-center gap-2">
                         <IconCalendar size={12} />
                         <span>Updated {formatCreationDate(lastUpdated)}</span>
                    </div>
                )}
            </div>
             <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <IconMessage size={12} />
                    <span>{messages?.length || 0} comments</span>
                </div>
                 <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors" 
                    onClick={() => {
                        navigator.clipboard.writeText(task._id);
                    }}
                    title="Copy Task ID"
                 >
                     <span>ID: {task._id.slice(-6)}</span>
                     <IconCopy size={12} />
                </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default TaskDetailPanel;
