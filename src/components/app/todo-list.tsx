import React from "react";
import { Todo } from "@/store/todo-store";
import { TodoItem } from "./todo-item";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

export function TodoList({ todos, onToggle, onRemove, onEdit }: TodoListProps) {
  const activeTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  if (todos.length === 0) {
    return <p className="text-gray-400 text-sm">No tasks yet.</p>;
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-0">
        {/* Active todos */}
        {activeTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onRemove={onRemove}
            onEdit={onEdit}
          />
        ))}

        {/* Completed todos in accordion */}
        {completedTodos.length > 0 && (
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="completed"
          >
            <AccordionItem value="completed">
              <AccordionTrigger className="text-sm text-gray-400">
                Completed ({completedTodos.length})
              </AccordionTrigger>
              <AccordionContent>
                {completedTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onRemove={onRemove}
                    onEdit={onEdit}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </ScrollArea>
  );
}
