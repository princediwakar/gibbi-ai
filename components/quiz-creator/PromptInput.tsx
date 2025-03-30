import { memo } from "react";
import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const PromptInput = memo(({ value, onChange, disabled }: PromptInputProps) => (
  <Textarea
    id="prompt"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Enter a topic or paste text content (optional if uploading PDF)"
    disabled={disabled}
    rows={4}
    className="w-full"
  />
));
PromptInput.displayName = "PromptInput";