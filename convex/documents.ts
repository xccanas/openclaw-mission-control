import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("taskId"), args.taskId))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.string(),
    path: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const docId = await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      type: args.type,
      path: args.path,
      taskId: args.taskId,
    });

    let message = `created document "${args.title}"`;
    if (args.taskId) {
        const task = await ctx.db.get(args.taskId);
        if (task) {
            message += ` for "${task.title}"`;
        }
    }

    await ctx.db.insert("activities", {
      type: "document_created",
      agentId: args.agentId,
      message: message,
      targetId: args.taskId,
    });

    return docId;
  },
});
