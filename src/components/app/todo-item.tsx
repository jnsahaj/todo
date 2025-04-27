import React, { useState, useRef, useEffect, forwardRef } from "react";
import { Todo } from "@/store/todo-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils"; // For conditional classes
import { parseISO, formatRelative } from "date-fns"; // <-- Import formatRelative
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { keyboardShortcuts } from "@/lib/keyboard-shortcuts"; // Import keyboard shortcuts manager

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  isFocused?: boolean;
  onFocusRequested?: () => void;
}

export const TodoItem = forwardRef<HTMLDivElement, TodoItemProps>(
  ({ todo, onToggle, onRemove, onEdit, isFocused, onFocusRequested }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when editing starts
    useEffect(() => {
      if (isEditing) {
        inputRef.current?.focus();
        inputRef.current?.select(); // Select text for easy replacement
      }
    }, [isEditing]);

    // Register/unregister keyboard shortcuts based on focus
    useEffect(() => {
      if (isFocused && !isEditing) {
        const toggleShortcutId = `toggle-todo-${todo.id}`;
        const deleteShortcutId = `delete-todo-${todo.id}`;
        const editShortcutId = `edit-todo-${todo.id}`; // New shortcut ID

        keyboardShortcuts.registerShortcut(toggleShortcutId, {
          key: "Enter",
          action: () => onToggle(todo.id),
          description: `Toggle completion for ${todo.text}`,
        });

        keyboardShortcuts.registerShortcut(deleteShortcutId, {
          key: "Backspace",
          action: () => onRemove(todo.id),
          description: `Delete ${todo.text}`,
        });

        // Register edit shortcut
        keyboardShortcuts.registerShortcut(editShortcutId, {
          key: "e",
          action: () => {
            setIsEditing(true);
          },
          description: `Edit ${todo.text}`,
        });

        // Cleanup function
        return () => {
          keyboardShortcuts.unregisterShortcut(toggleShortcutId);
          keyboardShortcuts.unregisterShortcut(deleteShortcutId);
          keyboardShortcuts.unregisterShortcut(editShortcutId); // Unregister edit shortcut
        };
      } else {
        // Ensure shortcuts are removed if not focused or if editing
        const toggleShortcutId = `toggle-todo-${todo.id}`;
        const deleteShortcutId = `delete-todo-${todo.id}`;
        const editShortcutId = `edit-todo-${todo.id}`; // Also unregister here
        keyboardShortcuts.unregisterShortcut(toggleShortcutId);
        keyboardShortcuts.unregisterShortcut(deleteShortcutId);
        keyboardShortcuts.unregisterShortcut(editShortcutId);
        // No cleanup needed here as we are unregistering immediately
        return undefined;
      }
    }, [
      isFocused,
      isEditing,
      todo.id,
      onToggle,
      onRemove,
      todo.text,
      setIsEditing,
    ]); // Add handleEdit to dependencies

    const handleEdit = () => {
      setIsEditing(true);
    };

    const handleSave = () => {
      if (editText.trim() && editText !== todo.text) {
        onEdit(todo.id, editText.trim());
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditText(todo.text); // Reset text
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.stopPropagation(); // Prevent event from bubbling up
        handleSave();
      } else if (e.key === "Escape") {
        e.stopPropagation(); // Prevent event from bubbling up
        handleCancel();
      }
    };

    return (
      <div
        ref={ref}
        tabIndex={-1} // Make it focusable
        onClick={onFocusRequested} // Request focus on click
        className={cn(
          "group flex flex-col gap-1 py-3 border-b border-border last:border-0 focus:outline-none rounded-sm -mx-1 px-4", // Basic focus styles
          isFocused && "bg-muted/50" // Highlight when programmatically focused
        )}
      >
        <div className="flex items-center gap-3">
          <Checkbox
            id={`todo-${todo.id}`}
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
            aria-label={`Mark ${todo.text} as ${
              todo.completed ? "incomplete" : "complete"
            }`}
            className="rounded-full"
          />
          {isEditing ? (
            <Input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave} // Save on blur
              onKeyDown={handleKeyDown}
              className="flex-grow h-8 text-sm border-0 border-b border-border focus-visible:ring-0 px-0 rounded-none"
            />
          ) : (
            <Label
              htmlFor={`todo-${todo.id}`}
              className={cn(
                "flex-grow cursor-pointer text-sm",
                todo.completed &&
                  "text-muted-foreground dark:text-muted-foreground line-through"
              )}
              onDoubleClick={handleEdit} // Edit on double click
            >
              {todo.text}
            </Label>
          )}
          {!isEditing && (
            <div
              className={cn(
                "flex gap-1 transition-opacity",
                isFocused
                  ? "opacity-100"
                  : "opacity-100 md:opacity-0 md:group-hover:opacity-100" // Show on focus or hover (on md+)
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-auto text-muted-foreground hover:text-foreground"
                onClick={handleEdit}
                aria-label={`Edit ${todo.text}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(todo.id)}
                aria-label={`Delete ${todo.text}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
        {todo.date && (
          <div className="flex items-center gap-3 ml-7 text-xs text-muted-foreground">
            {todo.date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {formatRelative(
                  parseISO(todo.time ? `${todo.date}T${todo.time}` : todo.date),
                  new Date()
                )}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

TodoItem.displayName = "TodoItem"; // Add display name for React DevTools
