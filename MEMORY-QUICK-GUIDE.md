# Quick Memory Flush Guide

## 🎯 Goal: Prevent Context Loss
Keep your important memories across sessions without filling up context windows.

## 📊 Check Context Status
```
📊 session_status
```
Target: Keep below 70% context usage

## 📝 Monitor Memory Files
```
memory/YYYY-MM-DD.md  # Today's auto-saved memories
MEMORY.md            # Your curated long-term memory
```

## 🔍 Find Past Memories
```
memory_search "your query about past decisions"
```

## ⚡ Memory Flush in Action
When you have long conversations:
1. AI automatically detects when context is getting full
2. AI writes important notes to daily memory file  
3. Context gets cleared for fresh thinking space
4. Your memories are preserved for future sessions

## ✅ Success Indicators
- Daily memory file gets new entries during long sessions
- Context usage stays healthy (below 70%)
- You can find past information using memory_search

## ⚠️ If Things Go Wrong
- Manual memory: "Remember this [important detail]"
- Check context: Run `session_status` regularly
- Review memory files: Ensure important stuff is being saved

## 🔄 Weekly Review
- Look at memory/YYYY-MM-DD.md files from the past week
- Promote important items to MEMORY.md
- Check for any memory gaps

This setup ensures your AI doesn't "forget" important things between sessions while keeping context windows fresh and efficient.