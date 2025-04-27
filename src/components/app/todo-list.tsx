import React, { useState, useRef, useEffect, createRef } from "react";
import { Todo } from "@/store/todo-store";
import { TodoItem } from "./todo-item";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { keyboardShortcuts } from "@/lib/keyboard-shortcuts";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  focusedIndex: number;
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
}

export function TodoList({
  todos,
  onToggle,
  onRemove,
  onEdit,
  focusedIndex,
  setFocusedIndex,
}: TodoListProps) {
  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true); // Track accordion state

  // Combine active and potentially visible completed todos
  const visibleTodos = [
    ...activeTodos,
    ...(isAccordionOpen ? completedTodos : []),
  ];

  // Refs for each visible todo item
  const itemRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  itemRefs.current = visibleTodos.map(
    (_, i) => itemRefs.current[i] ?? createRef<HTMLDivElement>()
  );

  // Effect to register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (direction: "up" | "down") => {
      // Prevent navigation if an input/textarea is focused within the list
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA") &&
        itemRefs.current.some((ref) =>
          ref.current?.contains(document.activeElement)
        )
      ) {
        return;
      }

      setFocusedIndex((prevIndex) => {
        let nextIndex;
        if (direction === "down") {
          nextIndex = prevIndex >= visibleTodos.length - 1 ? 0 : prevIndex + 1;
        } else {
          // direction === "up"
          nextIndex = prevIndex <= 0 ? visibleTodos.length - 1 : prevIndex - 1;
        }
        // Ensure the target ref exists before focusing
        if (itemRefs.current[nextIndex]?.current) {
          itemRefs.current[nextIndex].current?.focus();
          return nextIndex;
        }
        return prevIndex; // Don't change index if target ref is invalid
      });
    };

    keyboardShortcuts.registerShortcut("navigate-todo-down", {
      key: "ArrowDown",
      action: () => handleKeyDown("down"),
      description: "Focus next todo item",
    });

    keyboardShortcuts.registerShortcut("navigate-todo-up", {
      key: "ArrowUp",
      action: () => handleKeyDown("up"),
      description: "Focus previous todo item",
    });

    // Cleanup on unmount
    return () => {
      keyboardShortcuts.unregisterShortcut("navigate-todo-down");
      keyboardShortcuts.unregisterShortcut("navigate-todo-up");
    };
  }, [visibleTodos.length, setFocusedIndex]); // Add setFocusedIndex to dependencies

  // Function to handle focus request from child
  const handleFocusRequest = (index: number) => {
    if (itemRefs.current[index]?.current) {
      itemRefs.current[index].current?.focus();
      setFocusedIndex(index);
    }
  };

  if (todos.length === 0) {
    return <p className="text-muted-foreground text-sm">No tasks yet.</p>;
  }

  // Calculate the index offset for completed todos
  const completedTodoStartIndex = activeTodos.length;

  return (
    <ScrollArea className="h-full -mr-4 pr-4">
      <div className="space-y-0">
        {/* Active todos */}
        {activeTodos.map((todo, index) => (
          <TodoItem
            key={todo.id}
            ref={itemRefs.current[index]} // Assign ref
            todo={todo}
            onToggle={onToggle}
            onRemove={onRemove}
            onEdit={onEdit}
            isFocused={focusedIndex === index} // Pass focus state
            onFocusRequested={() => handleFocusRequest(index)} // Handle click focus
          />
        ))}

        {/* Completed todos in accordion */}
        {completedTodos.length > 0 && (
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="completed"
            onValueChange={(value) => setIsAccordionOpen(value === "completed")} // Update accordion state
          >
            <AccordionItem value="completed">
              <AccordionTrigger className="text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/30 rounded-sm -mx-1 px-1">
                Completed ({completedTodos.length})
              </AccordionTrigger>
              <AccordionContent>
                {completedTodos.map((todo, index) => {
                  const overallIndex = completedTodoStartIndex + index;
                  return (
                    <TodoItem
                      key={todo.id}
                      ref={itemRefs.current[overallIndex]} // Assign ref
                      todo={todo}
                      onToggle={onToggle}
                      onRemove={onRemove}
                      onEdit={onEdit}
                      isFocused={focusedIndex === overallIndex} // Pass focus state
                      onFocusRequested={() => handleFocusRequest(overallIndex)} // Handle click focus
                    />
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </ScrollArea>
  );
}
