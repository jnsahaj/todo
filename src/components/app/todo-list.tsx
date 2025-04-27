import React from "react";
import { Todo } from "@/store/todo-store";
import { TodoItem } from "./todo-item";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

export function TodoList({ todos, onToggle, onRemove, onEdit }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="text-gray-400 text-sm">No tasks yet.</p>;
  }

  return (
    <div className="space-y-0">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onRemove={onRemove}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
