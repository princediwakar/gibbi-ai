import { useState, useCallback, memo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

interface PDFUploaderProps {
  onUpload: (text: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export const PDFUploader = memo(({ onUpload, onClear, disabled }: PDFUploaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file");
      return;
    }

    setIsLoading(true);
    try {
      const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // Use type assertion to PDFTextContentItem or a custom interface
        text += content.items
          .map((item) => (item as { str: string }).str)
          .join(" ") + " ";
      }
      setFileName(file.name);
      onUpload(text.trim());
      toast.success(`PDF "${file.name}" processed successfully`);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process PDF");
    } finally {
      setIsLoading(false);
    }
  }, [onUpload]);

  const handleClearFile = useCallback(() => {
    setFileName(null);
    onClear();
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("PDF file removed");
  }, [onClear]);

  const handleButtonClick = useCallback(() => {
    if (!isLoading && !disabled && fileInputRef.current) fileInputRef.current.click();
  }, [isLoading, disabled]);

  return (
    <div className="space-y-2">
      <label className="cursor-pointer block">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={isLoading || disabled}
          className="hidden"
          ref={fileInputRef}
        />
        <Button
          variant="outline"
          disabled={isLoading || disabled}
          className="w-full h-10 flex items-center justify-between"
          onClick={handleButtonClick}
        >
          <span className="flex-1 flex items-center min-w-0">
            <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap">
              {isLoading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : fileName ? (
                `Processed: ${fileName}`
              ) : (
                "Upload PDF"
              )}
            </span>
            {fileName && !isLoading && (
              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="ml-2 shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </span>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
});
PDFUploader.displayName = "PDFUploader";