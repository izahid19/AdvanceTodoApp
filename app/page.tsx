"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit2, Moon, Sun, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "next-themes";
import { format } from "date-fns";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  isEditing?: boolean;
}

const categories = ["Work", "Personal", "Shopping", "Health", "Important"];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newTodoCategory, setNewTodoCategory] = useState<string>();
  const [newTodoDueDate, setNewTodoDueDate] = useState<Date>();
  const { theme, setTheme } = useTheme();

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos, (key, value) => {
        if (key === "dueDate" && value) return new Date(value);
        return value;
      }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([...todos, { 
        id: Date.now(), 
        text: newTodo, 
        completed: false,
        category: newTodoCategory,
        dueDate: newTodoDueDate
      }]);
      setNewTodo("");
      setNewTodoCategory(undefined);
      setNewTodoDueDate(undefined);
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const startEditing = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isEditing: true } : todo
      )
    );
  };

  const updateTodo = (id: number, newText: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: newText, isEditing: false } : todo
      )
    );
  };

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-background to-muted py-8 transition-colors duration-300`}>
      <div className="max-w-md mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground">
              My Tasks
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={addTodo} className="space-y-4 mb-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Select
                  value={newTodoCategory}
                  onValueChange={setNewTodoCategory}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      {newTodoDueDate ? (
                        format(newTodoDueDate, "MMM d, yyyy")
                      ) : (
                        <span>Pick a due date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={newTodoDueDate}
                      onSelect={setNewTodoDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </form>

            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between bg-card p-3 rounded-lg shadow-sm border animate-in fade-in-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                    />
                    {todo.isEditing ? (
                      <Input
                        defaultValue={todo.text}
                        onBlur={(e) => updateTodo(todo.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateTodo(todo.id, e.currentTarget.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className="flex flex-col gap-1 flex-1">
                        <span
                          className={`${
                            todo.completed ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {todo.text}
                        </span>
                        <div className="flex gap-2">
                          {todo.category && (
                            <Badge variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {todo.category}
                            </Badge>
                          )}
                          {todo.dueDate && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(todo.dueDate, "MMM d, yyyy")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(todo.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {todos.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No tasks yet. Add one above!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}