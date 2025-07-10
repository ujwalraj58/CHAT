
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  Plus 
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  url: string;
}

const FilesPage = () => {
  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "project-proposal.pdf",
      size: 2458000,
      type: "application/pdf",
      uploadDate: new Date(2024, 6, 6, 14, 30),
      url: "#",
    },
    {
      id: "2",
      name: "team-photo.jpg",
      size: 1024000,
      type: "image/jpeg",
      uploadDate: new Date(2024, 6, 5, 10, 15),
      url: "#",
    },
    {
      id: "3",
      name: "meeting-notes.docx",
      size: 156000,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      uploadDate: new Date(2024, 6, 4, 16, 45),
      url: "#",
    },
  ]);

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (type.includes("pdf")) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getFileTypeColor = (type: string) => {
    if (type.startsWith("image/")) return "bg-green-100 text-green-800";
    if (type.includes("pdf")) return "bg-red-100 text-red-800";
    if (type.includes("document")) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (fileList: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          // Add files to state
          const newFiles: UploadedFile[] = fileList.map((file) => ({
            id: Date.now().toString() + Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date(),
            url: "#",
          }));
          
          setFiles((prev) => [...prev, ...newFiles]);
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">File Management</h2>
        <p className="text-muted-foreground">
          Upload and manage your files for AI analysis and processing
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {dragActive ? "Drop files here" : "Upload Files"}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop files here, or click to select files
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild>
                <span>
                  <Plus className="h-4 w-4 mr-2" />
                  Select Files
                </span>
              </Button>
            </label>
          </div>

          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files ({files.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-muted">
                  {getFileIcon(file.type)}
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">{file.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.uploadDate.toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge className={getFileTypeColor(file.type)}>
                  {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteFile(file.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {files.length === 0 && (
            <div className="text-center py-8">
              <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No files uploaded yet</h3>
              <p className="text-muted-foreground">
                Upload your first file to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FilesPage;
