import type { ComponentProps } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Modal } from '../../../../components/Modal/Modal'
import { formatBytes } from '../../../../utils/file'
import { useDeleteFile } from '../../hooks/useDeleteFile'
import { useDownloadFile } from '../../hooks/useDownloadUrl'
import { useIsUpdatingStorageLimit } from '../../hooks/useStorage'
import { useFileManagerStore } from '../../store/useFileManagerStore'
import { FilePreviewPanel } from '../FilePreviewPanel/FilePreviewPanel'
import { STORAGE_LIMIT_FORM_ID, StorageLimitForm } from '../StorageLimitForm/StorageLimitForm'
import './FileManagerModal.css'

type ModalProps = Omit<ComponentProps<typeof Modal>, 'open' | 'onClose'>

/**
 * The page's single modal instance. Its content depends on `modal.kind`
 * in the UI store: file preview, delete confirmation or storage-limit form.
 */
export function FileManagerModal() {
  const modal = useFileManagerStore((s) => s.modal)
  const open = useFileManagerStore((s) => s.modalOpen)
  const close = useFileManagerStore((s) => s.closeModal)
  const openDelete = useFileManagerStore((s) => s.openDelete)
  const deleteFile = useDeleteFile()
  const download = useDownloadFile()
  const savingLimit = useIsUpdatingStorageLimit()

  if (!modal) return null

  let props: ModalProps
  switch (modal.kind) {
    case 'delete': {
      const { file } = modal
      props = {
        size: 'sm',
        icon: 'alert',
        tone: 'red',
        title: 'Delete file?',
        footer: (
          <>
            <Button variant="secondary" onClick={close} data-autofocus>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon="trash"
              onClick={() => {
                deleteFile.mutate(file) // optimistic — the card disappears right away
                close()
              }}
            >
              Delete
            </Button>
          </>
        ),
        children: (
          <>
            <p className="confirm__text">
              Are you sure you want to delete <strong>{file.name}</strong>?
            </p>
            <p className="confirm__note">
              It will be removed from cloud storage and free up {formatBytes(file.size)}. This action cannot be undone.
            </p>
          </>
        ),
      }
      break
    }

    case 'preview': {
      const { file } = modal
      const downloading = download.isPending && download.variables?.id === file.id
      props = {
        size: file.type === 'pdf' ? 'lg' : 'md',
        icon: file.icon,
        tone: file.tone,
        title: file.name,
        subtitle: `${formatBytes(file.size)} • ${file.badge}`,
        footer: (
          <>
            <Button variant="ghost" icon="trash" onClick={() => openDelete(file)}>
              Delete
            </Button>
            <Button variant="secondary" icon="download" disabled={downloading} onClick={() => download.mutate(file)}>
              {downloading ? 'Preparing…' : 'Download'}
            </Button>
            <Button onClick={close}>Close</Button>
          </>
        ),
        children: <FilePreviewPanel key={file.id} file={file} />,
      }
      break
    }

    case 'storage-limit':
      props = {
        size: 'sm',
        icon: 'edit',
        tone: 'indigo',
        title: 'Edit storage limit',
        subtitle: 'Applies to all uploads',
        footer: (
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" form={STORAGE_LIMIT_FORM_ID} icon="check" disabled={savingLimit}>
              {savingLimit ? 'Saving…' : 'Save limit'}
            </Button>
          </>
        ),
        // Remount on every open so the form starts from the current limit
        children: <StorageLimitForm key={String(open)} onDone={close} />,
      }
      break
  }

  return <Modal open={open} onClose={close} {...props} />
}
