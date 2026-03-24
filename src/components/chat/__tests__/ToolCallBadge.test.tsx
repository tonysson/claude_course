import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolLabel } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeCall(toolName: string, args: Record<string, string>): ToolInvocation {
  return { toolCallId: "1", toolName, args, state: "call" };
}

function makeResult(toolName: string, args: Record<string, string>): ToolInvocation {
  return { toolCallId: "1", toolName, args, state: "result", result: "Success" };
}

// --- getToolLabel ---

test("getToolLabel: str_replace_editor create", () => {
  expect(getToolLabel(makeCall("str_replace_editor", { command: "create", path: "src/Button.tsx" }))).toBe("Creating Button.tsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(getToolLabel(makeCall("str_replace_editor", { command: "str_replace", path: "src/App.tsx" }))).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(getToolLabel(makeCall("str_replace_editor", { command: "insert", path: "src/App.tsx" }))).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(getToolLabel(makeCall("str_replace_editor", { command: "view", path: "src/App.tsx" }))).toBe("Reading App.tsx");
});

test("getToolLabel: file_manager rename", () => {
  expect(getToolLabel(makeCall("file_manager", { command: "rename", path: "src/old.tsx" }))).toBe("Renaming old.tsx");
});

test("getToolLabel: file_manager delete", () => {
  expect(getToolLabel(makeCall("file_manager", { command: "delete", path: "src/old.tsx" }))).toBe("Deleting old.tsx");
});

test("getToolLabel: unknown tool falls back to tool name", () => {
  expect(getToolLabel(makeCall("some_other_tool", {}))).toBe("some_other_tool");
});

test("getToolLabel: no path falls back to generic label", () => {
  expect(getToolLabel(makeCall("str_replace_editor", { command: "create" }))).toBe("Creating file");
});

// --- ToolCallBadge rendering ---

test("ToolCallBadge shows label", () => {
  render(<ToolCallBadge tool={makeCall("str_replace_editor", { command: "create", path: "src/Button.tsx" })} />);
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("ToolCallBadge pending state shows spinner, not green dot", () => {
  const { container } = render(
    <ToolCallBadge tool={makeCall("str_replace_editor", { command: "create", path: "src/Button.tsx" })} />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge done state shows green dot, not spinner", () => {
  const { container } = render(
    <ToolCallBadge tool={makeResult("str_replace_editor", { command: "create", path: "src/Button.tsx" })} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
