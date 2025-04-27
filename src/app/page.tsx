"use client";

import React, { useEffect } from "react";
import { useTodoStore } from "@/store/todo-store";
import { AddTodoForm } from "@/components/app/add-todo-form";
import { TodoList } from "@/components/app/todo-list";

export default function Home() {
  const todos = useTodoStore((state) => state.todos);
  const addTodo = useTodoStore((state) => state.addTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const removeTodo = useTodoStore((state) => state.removeTodo);
  const editTodo = useTodoStore((state) => state.editTodo);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.log("Notification permission denied.");
        }
      });
    }
  }, []);

  return (
    <main className="container mx-auto max-w-xl h-screen flex flex-col">
      <div className="flex-1 min-h-0 p-4">
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onRemove={removeTodo}
          onEdit={editTodo}
        />
      </div>
      <div className="px-4 pb-12">
        <AddTodoForm onAdd={addTodo} />
      </div>
    </main>
  );
}
