
"use client";

import { useState, useRef, type ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, XCircle, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // Added missing import

interface DocumentUploadProps {
  onFileSelect: (file: File | null) => void;
  isLoading?: boolean;
  disabled?: boolean; // New prop to disable after initial upload
}

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_FILE_TYPES = ['application/pdf']; // Restrict to PDF only as per typical financial doc context

export function DocumentUpload({ onFileSelect, isLoading, disabled }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return; // Do not process if disabled

    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Please select a PDF file smaller than ${MAX_FILE_SIZE_MB}MB.`,
          variant: "destructive",
        });
        setSelectedFile(null);
        onFileSelect(null);
        if(fileInputRef.current) fileInputRef.current.value = ""; 
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
         toast({
          title: "Invalid file type",
          description: `Only PDF files are allowed. You uploaded: ${file.type}`,
          variant: "destructive",
        });
        setSelectedFile(null);
        onFileSelect(null);
        if(fileInputRef.current) fileInputRef.current.value = ""; 
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      setSelectedFile(null);
      onFileSelect(null);
    }
  };

  const handleRemoveFile = () => {
    if (disabled) return; 
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  const triggerFileInput = () => {
    if (disabled || isLoading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={ALLOWED_FILE_TYPES.join(',')}
        disabled={isLoading || disabled}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={triggerFileInput}
        aria-label="Attach document"
        disabled={isLoading || disabled}
        className={cn("text-muted-foreground hover:text-primary", (disabled && !isLoading) && "opacity-50 cursor-not-allowed hover:text-muted-foreground")}
        title={disabled ? "PDF already uploaded for this session" : "Attach PDF document"}
      >
        <Paperclip className="h-5 w-5" />
      </Button>
      {selectedFile && !disabled && ( // Only show selected file info if not disabled (i.e., before first successful upload)
        <div className="flex items-center gap-2 p-2 pr-1 border rounded-md bg-secondary/50 text-sm text-foreground max-w-[150px] md:max-w-[200px]">
          <UploadCloud className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate" title={selectedFile.name}>{selectedFile.name}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRemoveFile} 
            className="h-6 w-6 shrink-0" 
            disabled={isLoading || disabled} 
            aria-label="Remove file"
          >
            <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}
