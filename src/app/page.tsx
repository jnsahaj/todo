"use client";

import React from "react";
import { useTodoStore } from "@/store/todo-store";
import { AddTodoForm } from "@/components/app/add-todo-form";
import { TodoList } from "@/components/app/todo-list";

export default function Home() {
  const todos = useTodoStore((state) => state.todos);
  const addTodo = useTodoStore((state) => state.addTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const removeTodo = useTodoStore((state) => state.removeTodo);
  const editTodo = useTodoStore((state) => state.editTodo);

  return (
    <main className="container mx-auto max-w-xl py-12 px-4 flex flex-col min-h-screen">
      <h1 className="text-xl font-normal text-left mb-8 text-gray-700 dark:text-gray-300">
        Tasks
      </h1>
      <div className="flex-grow mb-8">
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onRemove={removeTodo}
          onEdit={editTodo}
        />
      </div>
      <div className="mt-auto">
        <AddTodoForm onAdd={addTodo} />
      </div>
    </main>
  );
}
