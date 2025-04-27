import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Clock } from "lucide-react";
import * as chrono from "chrono-node";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Define type for chrono results for clarity
type ChronoResult = ReturnType<typeof chrono.parse>[0];

interface AddTodoFormProps {
  onAdd: (text: string, date?: string, time?: string) => void;
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [text, setText] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [parsedChronoResult, setParsedChronoResult] =
    useState<ChronoResult | null>(null);
  const [userInteractedWithPickers, setUserInteractedWithPickers] =
    useState(false);

  // Effect to parse text whenever it changes
  useEffect(() => {
    const results = chrono.parse(text);
    const firstResult = results.length > 0 ? results[0] : null;
    setParsedChronoResult(firstResult);

    if (firstResult && !userInteractedWithPickers) {
      const startDate = firstResult.start.date();
      setDate(startDate); // Pre-fill date picker

      // Pre-fill time picker if time components are known
      if (firstResult.start.isCertain("hour")) {
        setTime(format(startDate, "HH:mm"));
      }
    }
  }, [text, userInteractedWithPickers]); // Re-run when text changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    let finalDate: Date | undefined = undefined;
    let finalTime: string | undefined = undefined;
    let finalText = text;

    if (userInteractedWithPickers) {
      finalDate = date;
      finalTime = time || undefined;
    } else if (parsedChronoResult) {
      finalDate = parsedChronoResult.start.date();
      if (parsedChronoResult.start.isCertain("hour")) {
        finalTime = format(finalDate, "HH:mm");
      }
      // Remove the detected datetime from the text
      finalText = text.replace(parsedChronoResult.text, "").trim();
    }

    const formattedDate = finalDate
      ? format(finalDate, "yyyy-MM-dd")
      : undefined;
    onAdd(finalText, formattedDate, finalTime); // Pass cleaned text

    // Reset state
    setText("");
    setDate(undefined);
    setTime("");
    setParsedChronoResult(null);
    setUserInteractedWithPickers(false); // Reset interaction flag
    setIsCalendarOpen(false);
    setIsTimePickerOpen(false);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setUserInteractedWithPickers(true); // Mark interaction
    setDate(selectedDate);
    setIsCalendarOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInteractedWithPickers(true); // Mark interaction
    setTime(e.target.value);
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="todo-input" className="text-sm font-medium">
            Add a new task
          </Label>
          <div className="flex gap-2">
            <Input
              id="todo-input"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-grow"
            />
            <div className="flex gap-1">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-10 w-10",
                      date && "bg-accent text-accent-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover
                open={isTimePickerOpen}
                onOpenChange={setIsTimePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-10 w-10",
                      time && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="end">
                  <Input
                    type="time"
                    value={time}
                    onChange={handleTimeChange}
                    className="w-[120px]"
                  />
                </PopoverContent>
              </Popover>

              <Button
                type="submit"
                size="icon"
                className="h-10 w-10"
                disabled={!text.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {(parsedChronoResult || date) && (
          <div className="flex flex-wrap gap-2">
            {parsedChronoResult && (
              <Badge variant="outline" className="text-xs">
                Detected: {parsedChronoResult.text} (
                {format(parsedChronoResult.start.date(), "MMM d, yyyy") +
                  (parsedChronoResult.start.isCertain("hour")
                    ? " " + format(parsedChronoResult.start.date(), "HH:mm")
                    : "")}
                )
              </Badge>
            )}
            {date && (
              <Badge variant="secondary" className="text-xs">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {format(date, "MMM d, yyyy")}
                {time && (
                  <>
                    <Clock className="ml-1 mr-1 h-3 w-3" />
                    {time}
                  </>
                )}
              </Badge>
            )}
          </div>
        )}
      </form>
    </Card>
  );
}
