type ModifierKey = "Control" | "Alt" | "Shift" | "Meta";
type KeyAction = () => void;

interface Shortcut {
  key: string;
  modifiers?: ModifierKey[];
  action: KeyAction;
  description?: string;
}

class KeyboardShortcutsManager {
  private shortcuts: Map<string, Shortcut> = new Map();
  private pressedKeys: Set<string> = new Set();
  private isMac: boolean;

  constructor() {
    this.isMac =
      typeof window !== "undefined" &&
      /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    this.pressedKeys.add(event.key);
    this.checkShortcuts(event);
  }

  private handleKeyUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key);
  }

  private checkShortcuts(event: KeyboardEvent) {
    for (const [, shortcut] of this.shortcuts) {
      if (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        this.checkModifiers(event, shortcut.modifiers || [])
      ) {
        event.preventDefault();
        shortcut.action();
      }
    }
  }

  private checkModifiers(
    event: KeyboardEvent,
    requiredModifiers: ModifierKey[]
  ): boolean {
    return requiredModifiers.every((modifier) => {
      switch (modifier) {
        case "Control":
          // On Mac, Control key is used for right-click, so we don't want to trigger shortcuts with it
          return !this.isMac && event.ctrlKey;
        case "Meta":
          // On Mac, Meta is Command key
          return this.isMac ? event.metaKey : event.ctrlKey;
        case "Alt":
          return event.altKey;
        case "Shift":
          return event.shiftKey;
        default:
          return false;
      }
    });
  }

  registerShortcut(id: string, shortcut: Shortcut) {
    this.shortcuts.set(id, shortcut);
  }

  unregisterShortcut(id: string) {
    this.shortcuts.delete(id);
  }

  getShortcuts(): Map<string, Shortcut> {
    return new Map(this.shortcuts);
  }
}

// Export a singleton instance
export const keyboardShortcuts = new KeyboardShortcutsManager();

// Helper function to create shortcuts
export function createShortcut(
  key: string,
  action: KeyAction,
  modifiers?: ModifierKey[],
  description?: string
): Shortcut {
  return {
    key,
    modifiers,
    action,
    description,
  };
}
