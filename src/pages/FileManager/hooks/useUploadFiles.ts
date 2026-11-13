import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { toast } from '../../../store/useToastStore'
import { resolveMimeType } from '../../../utils/file'
import { uploadsApi } from '../api/uploads.api'
import { UPLOAD_CONCURRENCY } from '../constants/fileManager.constants'
import { useFileManagerStore } from '../store/useFileManagerStore'
import type { UploadItem } from '../types/fileManager.types'
import { fileKeys, storageKeys } from './queryKeys'

/** How long a finished item stays in the queue list */
const DONE_LINGER_MS = 1800

/**
 * Runs the presigned upload flow for every queued file:
 * presigned-url → PUT to S3 (with progress) → complete.
 * Per-file status/progress lives in the UI store; results refresh the file list + storage.
 */
export function useUploadFiles() {
  const queryClient = useQueryClient()
  const controllers = useRef(new Map<string, AbortController>())

  const mutation = useMutation({
    mutationKey: fileKeys.upload(),
    mutationFn: async (item: UploadItem) => {
      const { updateUpload } = useFileManagerStore.getState()
      const controller = new AbortController()
      controllers.current.set(item.id, controller)
      const { signal } = controller

      updateUpload(item.id, { status: 'uploading', progress: 0, error: undefined })
      const presigned = await uploadsApi.createPresignedUrl(
        { fileName: item.file.name, mimeType: resolveMimeType(item.file), fileSize: item.file.size },
        signal,
      )
      await uploadsApi.uploadToS3(presigned, item.file, {
        signal,
        onProgress: (progress) => updateUpload(item.id, { progress }),
      })
      updateUpload(item.id, { status: 'completing', progress: 100 })
      return uploadsApi.complete({ uploadSessionId: presigned.uploadSessionId }, signal)
    },
    onSuccess: (file, item) => {
      const { updateUpload, removeUpload, markRecent } = useFileManagerStore.getState()
      updateUpload(item.id, { status: 'done' })
      markRecent(file.id)
      setTimeout(() => removeUpload(item.id), DONE_LINGER_MS)
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() })
    },
    onError: (error, item) => {
      const { updateUpload, removeUpload } = useFileManagerStore.getState()
      if (error.isCancelled) removeUpload(item.id)
      else updateUpload(item.id, { status: 'error', error: error.message })
    },
    onSettled: (_data, _error, item) => {
      controllers.current.delete(item.id)
      // Space was reserved (and maybe released) — refresh the quota either way
      queryClient.invalidateQueries({ queryKey: storageKeys.all })
    },
  })

  const { mutateAsync } = mutation

  /** Upload a list of items with limited parallelism. */
  async function run(items: UploadItem[]) {
    let next = 0
    let failed = 0
    const worker = async () => {
      while (next < items.length) {
        const item = items[next++]
        await mutateAsync(item).catch((error) => {
          if (!error?.isCancelled) failed++
        })
      }
    }
    await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, items.length) }, worker))

    const succeeded = items.length - failed
    if (failed && succeeded) toast.error(`${failed} of ${items.length} uploads failed`, 'Retry them from the upload list.')
    else if (failed) toast.error(items.length === 1 ? 'Upload failed' : 'Uploads failed', 'Retry from the upload list.')
    else if (succeeded) toast.success(succeeded === 1 ? 'File uploaded' : `${succeeded} files uploaded`)
  }

  return {
    /** Upload every queued file */
    uploadQueued: () => run(useFileManagerStore.getState().uploads.filter((u) => u.status === 'queued')),
    /** Retry one failed file */
    retry: (id: string) => {
      const item = useFileManagerStore.getState().uploads.find((u) => u.id === id)
      if (item) run([item])
    },
    /** Abort an in-flight upload (its reservation is released by the server automatically) */
    cancel: (id: string) => controllers.current.get(id)?.abort(),
  }
}

/** True while any upload is in flight — usable from any component. */
export function useIsUploading() {
  return useIsMutating({ mutationKey: fileKeys.upload() }) > 0
}
