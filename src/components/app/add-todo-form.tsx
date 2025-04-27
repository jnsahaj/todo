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

    if (userInteractedWithPickers) {
      finalDate = date;
      finalTime = time || undefined;
    } else if (parsedChronoResult) {
      finalDate = parsedChronoResult.start.date();
      if (parsedChronoResult.start.isCertain("hour")) {
        finalTime = format(finalDate, "HH:mm");
      }
    }

    const formattedDate = finalDate
      ? format(finalDate, "yyyy-MM-dd")
      : undefined;
    onAdd(text, formattedDate, finalTime); // Pass original text

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2 items-center border-t pt-4 border-gray-100 dark:border-gray-800">
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task"
          className="flex-grow border-0 focus-visible:ring-0 px-0 text-sm placeholder:text-gray-400"
        />
        <div className="flex gap-1">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  date && "text-gray-700 dark:text-gray-300"
                )}
                onClick={() => setIsCalendarOpen(true)}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  time && "text-gray-700 dark:text-gray-300"
                )}
              >
                <Clock className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <Input
                type="time"
                value={time}
                onChange={handleTimeChange}
                className="w-[120px] h-8 text-sm"
              />
            </PopoverContent>
          </Popover>

          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {parsedChronoResult && (
        <div className="text-xs text-gray-400 pl-1">
          Detected: {parsedChronoResult.text} (
          {format(parsedChronoResult.start.date(), "MMM d, yyyy") +
            (parsedChronoResult.start.isCertain("hour")
              ? " " + format(parsedChronoResult.start.date(), "HH:mm")
              : "")}
          )
        </div>
      )}
      {date && (
        <div className="flex items-center text-xs text-gray-400 pl-1 gap-2">
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {format(date, "MMM d, yyyy")}
          </span>
          {time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {time}
            </span>
          )}
        </div>
      )}
    </form>
  );
}
