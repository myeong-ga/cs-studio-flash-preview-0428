import type { FileStatus } from "@/lib/store"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { FileState } from "@/lib/types"

interface FileStatusListProps {
  files: FileStatus[]
}

export function FileStatusList({ files }: FileStatusListProps) {
  const getStatusIcon = (status: FileState) => {
    switch (status) {
      case FileState.ACTIVE:
      case FileState.STATE_UNSPECIFIED: // Also show check icon for STATE_UNSPECIFIED
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case FileState.FAILED:
        return <XCircle className="h-4 w-4 text-red-500" />
      case FileState.PROCESSING:
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" /> // Default to success icon
    }
  }

  const getStatusText = (status: FileState) => {
    switch (status) {
      case FileState.ACTIVE:
      case FileState.STATE_UNSPECIFIED: // Also show "Active" for STATE_UNSPECIFIED
        return "Active"
      case FileState.FAILED:
        return "Failed"
      case FileState.PROCESSING:
        return "Processing"
      default:
        return "Active" // Default to "Active"
    }
  }

  return (
    <ul className="space-y-2">
      {files.map((file) => (
        <li key={file.name} className="flex items-center justify-between p-3 border rounded-md">
          <span className="font-medium truncate max-w-[60%]">{file.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{getStatusText(file.status)}</span>
            {getStatusIcon(file.status)}
          </div>
          {file.error && <div className="text-xs text-red-500 mt-1">{file.error}</div>}
        </li>
      ))}
    </ul>
  )
}
