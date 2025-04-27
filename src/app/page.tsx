"use client";

import React, { useEffect } from "react";
import { useTodoStore } from "@/store/todo-store";
import { AddTodoForm } from "@/components/app/add-todo-form";
import { TodoList } from "@/components/app/todo-list";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import Github from "@/assets/github.svg";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col h-screen">
      <header className="w-full flex items-center justify-between pb-1 pt-2 px-2">
        <div className="w-8" />
        <h1 className="text-lg font-semibold text-center flex-1">Tasks</h1>
        <div className="flex items-center gap-0">
          <Link href="https://github.com/jnsahaj/todo" target="_blank">
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="container mx-auto max-w-xl flex flex-1 flex-col min-h-0">
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
    </div>
  );
}
