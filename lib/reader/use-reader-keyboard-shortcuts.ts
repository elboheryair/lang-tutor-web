import { useEffect } from "react";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

type UseReaderKeyboardShortcutsOptions = {
  enabled: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPreviousLine: () => void;
  onNextLine: () => void;
  onRecord: () => void;
  onTogglePause: () => void;
  onRequestExit: () => void;
  onDecreaseFont: () => void;
  onIncreaseFont: () => void;
};

export function useReaderKeyboardShortcuts({
  enabled,
  canGoPrevious,
  canGoNext,
  onPreviousLine,
  onNextLine,
  onRecord,
  onTogglePause,
  onRequestExit,
  onDecreaseFont,
  onIncreaseFont,
}: UseReaderKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;

      switch (event.key) {
        case "ArrowLeft":
          if (canGoPrevious) {
            event.preventDefault();
            onPreviousLine();
          }
          break;
        case "ArrowRight":
          if (canGoNext) {
            event.preventDefault();
            onNextLine();
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          onRecord();
          break;
        case " ":
          event.preventDefault();
          onTogglePause();
          break;
        case "Escape":
          event.preventDefault();
          onRequestExit();
          break;
        case "-":
        case "_":
          event.preventDefault();
          onDecreaseFont();
          break;
        case "+":
        case "=":
          event.preventDefault();
          onIncreaseFont();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    canGoPrevious,
    canGoNext,
    onPreviousLine,
    onNextLine,
    onRecord,
    onTogglePause,
    onRequestExit,
    onDecreaseFont,
    onIncreaseFont,
  ]);
}