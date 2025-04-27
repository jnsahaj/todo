import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Clock } from "lucide-react";
import * as chrono from "chrono-node";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Define type for chrono results for clarity
type ChronoResult = ReturnType<typeof chrono.parse>[0];

// Helper function to escape HTML characters
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface AddTodoFormProps {
  onAdd: (text: string, date?: string, time?: string) => void;
}

export const AddTodoForm = forwardRef<{ focus: () => void }, AddTodoFormProps>(
  ({ onAdd }, ref) => {
    const [text, setText] = useState("");
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState("");
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [parsedChronoResult, setParsedChronoResult] =
      useState<ChronoResult | null>(null);
    const [userInteractedWithPickers, setUserInteractedWithPickers] =
      useState(false);
    const contentEditableRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        contentEditableRef.current?.focus();
      },
    }));

    // Effect to parse text whenever it changes
    useEffect(() => {
      const results = chrono.parse(text);
      const firstResult = results.length > 0 ? results[0] : null;
      setParsedChronoResult(firstResult);

      if (firstResult && !userInteractedWithPickers) {
        const startDate = firstResult.start.date();
        setDate(startDate);

        if (firstResult.start.isCertain("hour")) {
          setTime(format(startDate, "HH:mm"));
        }
      } else if (!firstResult) {
        // If no result, ensure date/time derived from text are cleared
        // but only if the user hasn't manually set them
        if (!userInteractedWithPickers) {
          setDate(undefined);
          setTime("");
        }
      }
    }, [text, userInteractedWithPickers]);

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
        finalText = text.replace(parsedChronoResult.text, "").trim();
      }

      const formattedDate = finalDate
        ? format(finalDate, "yyyy-MM-dd")
        : undefined;

      // Schedule notification via Service Worker if date and time are set and in the future
      if (formattedDate && finalTime && finalDate) {
        const notificationDateTime = new Date(`${formattedDate}T${finalTime}`);
        const now = new Date();

        if (notificationDateTime > now && navigator.serviceWorker.controller) {
          const timestamp = notificationDateTime.getTime();
          const title = "Todo Reminder";
          const options = {
            body: finalText,
            icon: "/favicon.ico", // Optional
          };

          console.log(
            `Form: Sending message to SW to schedule notification for: ${notificationDateTime}`
          );

          navigator.serviceWorker.controller.postMessage({
            title,
            options,
            timestamp,
          });
        } else if (notificationDateTime <= now) {
          console.log(
            "Scheduled time is in the past, not setting notification."
          );
        } else if (!navigator.serviceWorker.controller) {
          console.warn(
            "Service worker controller not available, cannot send notification message."
          );
        }
      }

      onAdd(finalText, formattedDate, finalTime);

      setText("");
      setDate(undefined);
      setTime("");
      setParsedChronoResult(null);
      setUserInteractedWithPickers(false);
      setIsCalendarOpen(false);
      setIsTimePickerOpen(false);

      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = "";
      }
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
      setUserInteractedWithPickers(true);
      setDate(selectedDate);
      setIsCalendarOpen(false);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserInteractedWithPickers(true);
      setTime(e.target.value);
    };

    // Added handleKeyDown for Shift+Enter submit
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevent default Enter behavior (new line)
        handleSubmit(e as unknown as React.FormEvent); // Trigger form submission
      }
      // Allow Shift+Enter for new line (default behavior)
    };

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
      const div = e.currentTarget;
      const currentText = div.textContent || "";
      setText(currentText); // Update state

      // Parse the plain text
      const results = chrono.parse(currentText);
      const firstResult = results.length > 0 ? results[0] : null;
      setParsedChronoResult(firstResult); // Update state

      let newHtml = escapeHtml(currentText); // Default to escaped plain text
      let domChanged = false;

      if (firstResult) {
        const startIndex = currentText.indexOf(firstResult.text);
        if (startIndex !== -1) {
          const endIndex = startIndex + firstResult.text.length;
          // Construct HTML with highlight span
          newHtml =
            escapeHtml(currentText.substring(0, startIndex)) +
            `<span class="text-blue-700 dark:text-blue-400">${escapeHtml(
              firstResult.text
            )}</span>` +
            escapeHtml(currentText.substring(endIndex));
        }
      }

      // Only update DOM if HTML needs to change, to avoid cursor jumps
      if (div.innerHTML !== newHtml) {
        div.innerHTML = newHtml;
        domChanged = true;
      }

      // Restore cursor to end ONLY if DOM changed
      if (domChanged) {
        const selection = window.getSelection();
        if (selection && div) {
          const range = document.createRange();
          range.selectNodeContents(div);
          range.collapse(false); // false collapses to the end
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    };

    return (
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div
                ref={contentEditableRef}
                contentEditable
                id="todo-input"
                onInput={handleContentChange}
                onKeyDown={handleKeyDown}
                data-placeholder="What needs to be done?"
                className={cn(
                  "flex-grow min-h-[40px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
                )}
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
                    <input
                      type="time"
                      value={time}
                      onChange={handleTimeChange}
                      className="w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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

          {/* Reserve space for the badge section to prevent layout shift */}
          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground min-h-[20px]">
            {(parsedChronoResult ||
              (date && time) ||
              (date && !time) ||
              (!date && time)) && (
              <>
                <span>Set for:</span>
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
              </>
            )}
          </div>
        </form>
      </div>
    );
  }
);

AddTodoForm.displayName = "AddTodoForm";
