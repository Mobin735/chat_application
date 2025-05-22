"use client";

import { useState, useRef, type ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, XCircle, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  onFileSelect: (file: File | null) => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];

export function DocumentUpload({ onFileSelect, isLoading }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Please select a file smaller than ${MAX_FILE_SIZE_MB}MB.`,
          variant: "destructive",
        });
        setSelectedFile(null);
        onFileSelect(null);
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset input
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
         toast({
          title: "Invalid file type",
          description: `Allowed file types are: PDF, JPG, PNG, TXT. You uploaded: ${file.type}`,
          variant: "destructive",
        });
        setSelectedFile(null);
        onFileSelect(null);
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset input
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
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input
    }
  };

  const triggerFileInput = () => {
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
        disabled={isLoading}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={triggerFileInput}
        aria-label="Attach document"
        disabled={isLoading}
        className="text-muted-foreground hover:text-primary"
      >
        <Paperclip className="h-5 w-5" />
      </Button>
      {selectedFile && (
        <div className="flex items-center gap-2 p-2 pr-1 border rounded-md bg-secondary/50 text-sm text-foreground max-w-[150px] md:max-w-[200px]">
          <UploadCloud className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate" title={selectedFile.name}>{selectedFile.name}</span>
          <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="h-6 w-6 shrink-0" disabled={isLoading} aria-label="Remove file">
            <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}
