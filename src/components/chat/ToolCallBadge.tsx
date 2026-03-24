"use client";

import type { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

export function getToolLabel(tool: ToolInvocation): string {
  const args = tool.args as Record<string, string>;
  const filename = args.path ? args.path.split("/").pop() : null;

  if (tool.toolName === "str_replace_editor") {
    const cmd = args.command;
    if (cmd === "create") return filename ? `Creating ${filename}` : "Creating file";
    if (cmd === "str_replace" || cmd === "insert") return filename ? `Editing ${filename}` : "Editing file";
    if (cmd === "view") return filename ? `Reading ${filename}` : "Reading file";
  }

  if (tool.toolName === "file_manager") {
    const cmd = args.command;
    if (cmd === "rename") return filename ? `Renaming ${filename}` : "Renaming file";
    if (cmd === "delete") return filename ? `Deleting ${filename}` : "Deleting file";
  }

  return tool.toolName;
}

interface ToolCallBadgeProps {
  tool: ToolInvocation;
}

export function ToolCallBadge({ tool }: ToolCallBadgeProps) {
  const label = getToolLabel(tool);
  const isDone = tool.state === "result" && tool.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
