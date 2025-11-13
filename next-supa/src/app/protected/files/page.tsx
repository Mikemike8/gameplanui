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
  Filter,
  MoreVertical,
  X,
  Folder,
  Eye,
  Link as LinkIcon,
  Users,
  Clock,
  Grid3x3,
  List,
} from "lucide-react";

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

export default function FileSharingPage() {
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
        f.id === selectedFile.id
          ? { ...f, sharedWith: [...f.sharedWith, shareEmail] }
          : f
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access file sharing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">File Sharing</h1>
              <p className="text-gray-600 mt-1">Upload, share, and manage your files</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">All Files</option>
                <option value="images">Images</option>
                <option value="videos">Videos</option>
                <option value="documents">Documents</option>
              </select>
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-violet-100 text-violet-600" : "bg-white text-gray-600"}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-violet-100 text-violet-600" : "bg-white text-gray-600"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`bg-white rounded-lg border-2 border-dashed p-12 mb-6 text-center transition-colors ${
            isDragging ? "border-violet-600 bg-violet-50" : "border-gray-300"
          }`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            <span className="font-medium text-violet-600 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-sm text-gray-500">PNG, JPG, PDF, MP4 up to 100MB</p>
        </div>

        {/* Files Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-violet-100 rounded-lg">
                      <FileIcon className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="relative group">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      <div className="hidden group-hover:block absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                        <button
                          onClick={() => handleShareFile(file)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{formatFileSize(file.size)}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(file.uploadedAt)}
                  </div>
                  {file.sharedWith.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      Shared with {file.sharedWith.length}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shared With</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFiles.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-violet-100 rounded">
                            <FileIcon className="w-5 h-5 text-violet-600" />
                          </div>
                          <span className="font-medium text-gray-900">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatFileSize(file.size)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(file.uploadedAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {file.sharedWith.length > 0 ? `${file.sharedWith.length} people` : "Not shared"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleShareFile(file)}
                            className="p-2 hover:bg-gray-100 rounded text-gray-600"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded text-gray-600">
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-2 hover:bg-gray-100 rounded text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredFiles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No files found</p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Share File</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">Share "{selectedFile.name}" with others</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    onClick={handleAddShare}
                    className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {selectedFile.sharedWith.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shared With</label>
                  <div className="space-y-2">
                    {selectedFile.sharedWith.map((email, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{email}</span>
                        <button className="text-red-600 hover:bg-red-50 p-1 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  <LinkIcon className="w-4 h-4" />
                  Copy Share Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}