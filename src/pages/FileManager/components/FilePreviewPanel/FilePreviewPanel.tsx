import { FilePreview } from '../../../../components/FilePreview/FilePreview'
import type { FileItem } from '../../../../types/file'
import { formatBytes, formatDateTime } from '../../../../utils/file'
import { usePreviewUrl } from '../../hooks/useDownloadUrl'
import { useFileDetails } from '../../hooks/useFileDetails'

interface FilePreviewPanelProps {
  file: FileItem
}

/** Preview modal body: fetches a presigned inline URL + fresh file details. */
export function FilePreviewPanel({ file }: FilePreviewPanelProps) {
  const details = useFileDetails(file.id)
  const preview = usePreviewUrl(file.id)
  const current = details.data ?? file

  return (
    <FilePreview
      name={current.name}
      type={current.type}
      url={preview.data?.downloadUrl}
      isLoading={preview.isPending}
      error={preview.error?.message}
      onRetry={() => preview.refetch()}
      details={[
        { label: 'Type', value: current.mimeType },
        { label: 'Size', value: formatBytes(current.size) },
        { label: 'Uploaded', value: formatDateTime(current.addedAt) },
      ]}
    />
  )
}
