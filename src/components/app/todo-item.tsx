import React, { useState, useRef, useEffect } from "react";
import { Todo } from "@/store/todo-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils"; // For conditional classes
import { format, parseISO } from "date-fns";
import { CalendarDays, Clock, Pencil, Trash2 } from "lucide-react";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

export function TodoItem({ todo, onToggle, onRemove, onEdit }: TodoItemProps) {
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
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="group flex flex-col gap-1 py-3 border-b border-border last:border-0">
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
          <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
      {(todo.date || todo.time) && (
        <div className="flex items-center gap-3 pl-[34px] text-xs text-muted-foreground">
          {todo.date && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {format(parseISO(todo.date), "MMM d, yyyy")}
            </span>
          )}
          {todo.time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {todo.time}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
