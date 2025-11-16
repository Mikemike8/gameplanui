// src/components/Workspace/FilePanel.tsx
"use client";

import React, { useState, useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Upload,
  File,
  Image,
  Video,
  Music,
  FileText,
  Download,
  Trash2,
  Share2,
  Search,
  MoreVertical,
  X,
  Link as LinkIcon,
  Users,
  Clock,
  Grid3x3,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
  sharedWith: string[];
  url: string;
  thumbnail?: string;
}

interface FilePanelProps {
  variant?: "page" | "embedded";
}

export function FilePanel({ variant = "embedded" }: FilePanelProps) {
  const { user, isLoading } = useUser();
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "Project Proposal.pdf",
      size: 2456789,
      type: "application/pdf",
      uploadedBy: "John Doe",
      uploadedAt: new Date("2024-11-10"),
      sharedWith: ["team@example.com"],
      url: "#",
    },
    {
      id: "2",
      name: "Design Mockup.png",
      size: 5234567,
      type: "image/png",
      uploadedBy: "Jane Smith",
      uploadedAt: new Date("2024-11-09"),
      sharedWith: ["design@example.com"],
      url: "#",
    },
    {
      id: "3",
      name: "Meeting Recording.mp4",
      size: 45678901,
      type: "video/mp4",
      uploadedBy: "Mike Johnson",
      uploadedAt: new Date("2024-11-08"),
      sharedWith: ["everyone"],
      url: "#",
    },
  ]);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    if (type.startsWith("video/")) return Video;
    if (type.startsWith("audio/")) return Music;
    if (type.includes("pdf") || type.includes("document")) return FileText;
    return File;
  };

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || !user) return;

    Array.from(uploadedFiles).forEach((file) => {
      const newFile: FileItem = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: user.name || user.email || "You",
        uploadedAt: new Date(),
        sharedWith: [],
        url: URL.createObjectURL(file),
      };
      setFiles((prev) => [newFile, ...prev]);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDeleteFile = (id: string) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleShareFile = (file: FileItem) => {
    setSelectedFile(file);
    setShowShareModal(true);
  };

  const handleAddShare = () => {
    if (!selectedFile || !shareEmail) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === selectedFile.id ? { ...f, sharedWith: [...f.sharedWith, shareEmail] } : f
      )
    );
    setShareEmail("");
    setShowShareModal(false);
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "images" && file.type.startsWith("image/")) ||
      (filterType === "videos" && file.type.startsWith("video/")) ||
      (filterType === "documents" && (file.type.includes("pdf") || file.type.includes("document")));
    return matchesSearch && matchesFilter;
  });

  const wrapperClass =
    variant === "page"
      ? "min-h-screen bg-gray-50"
      : "h-full overflow-y-auto bg-background border-t border-border";

  const innerClass =
    variant === "page"
      ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
      : "px-4 py-4 space-y-6";

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center", wrapperClass)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn("flex items-center justify-center", wrapperClass)}>
        <div className="text-center">
          <p className="text-gray-600">Please log in to access file sharing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className={innerClass}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Files</h1>
            <p className="text-muted-foreground">Upload, share, and collaborate on team files.</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 border rounded-md px-3 py-2 hover:bg-accent">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-md px-3 py-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>
        </div>

        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border",
            "cursor-pointer"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
          <p className="text-lg font-medium mt-4">Drag and drop files here</p>
          <p className="text-sm text-muted-foreground">
            Supports images, videos, PDFs, and documents
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 border rounded-md px-4 py-2 hover:bg-accent"
          >
            <Upload className="w-4 h-4" />
            Browse files
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              className="w-full border rounded-md pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={cn(
                "px-3 py-2 rounded-md border",
                filterType === "all" ? "bg-primary text-primary-foreground" : "bg-background"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("images")}
              className={cn(
                "px-3 py-2 rounded-md border",
                filterType === "images" ? "bg-primary text-primary-foreground" : "bg-background"
              )}
            >
              Images
            </button>
            <button
              onClick={() => setFilterType("videos")}
              className={cn(
                "px-3 py-2 rounded-md border",
                filterType === "videos" ? "bg-primary text-primary-foreground" : "bg-background"
              )}
            >
              Videos
            </button>
            <button
              onClick={() => setFilterType("documents")}
              className={cn(
                "px-3 py-2 rounded-md border",
                filterType === "documents" ? "bg-primary text-primary-foreground" : "bg-background"
              )}
            >
              Documents
            </button>
          </div>

          <div className="flex gap-1 border rounded-md p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-3 py-2 rounded-md",
                viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background"
              )}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-2 rounded-md",
                viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <div key={file.id} className="border rounded-lg p-4 bg-white space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-full bg-primary/5">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold truncate">{file.name}</h3>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Users className="w-4 h-4" />
                    Shared with {file.sharedWith.length || "no one"}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uploaded {formatDate(file.uploadedAt)}</span>
                    <button className="text-primary hover:underline" onClick={() => handleShareFile(file)}>
                      Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-muted-foreground border-b">
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Shared With</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Uploaded</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <div key={file.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center border-b">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="p-2 rounded bg-primary/5">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">{file.type}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {file.sharedWith.length ? file.sharedWith.join(", ") : "Private"}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">{formatFileSize(file.size)}</div>
                  <div className="col-span-2 text-sm text-muted-foreground">{formatDate(file.uploadedAt)}</div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button className="p-2 hover:bg-accent rounded" onClick={() => window.open(file.url, "_blank")}>
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-accent rounded" onClick={() => handleShareFile(file)}>
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-destructive/10 rounded text-destructive" onClick={() => handleDeleteFile(file.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedFile && showShareModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Share "{selectedFile.name}"</h3>
                <button
                  className="p-1 rounded hover:bg-muted"
                  onClick={() => {
                    setSelectedFile(null);
                    setShowShareModal(false);
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Add people</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="flex-1 border rounded-md px-3 py-2"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                  <button
                    onClick={handleAddShare}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  >
                    Share
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Shared with</span>
                <div className="border rounded-md divide-y">
                  {selectedFile.sharedWith.length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground">Not shared with anyone yet.</div>
                  )}
                  {selectedFile.sharedWith.map((email) => (
                    <div key={email} className="p-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {email}
                      </div>
                      <button className="text-destructive text-xs">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  Anyone with the link can view
                </div>
                <button className="text-primary text-sm">Copy link</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
