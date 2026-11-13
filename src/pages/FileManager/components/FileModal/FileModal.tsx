import { Button, ButtonLink } from '../../../../components/Button/Button'
import { FilePreview } from '../../../../components/FilePreview/FilePreview'
import { Modal } from '../../../../components/Modal/Modal'
import { formatBytes } from '../../../../utils/file'
import { useDeleteFile } from '../../hooks/useDeleteFile'
import { useFileManagerStore } from '../../store/useFileManagerStore'
import './FileModal.css'

/**
 * The page's single modal instance. Shows either the file preview or the
 * delete confirmation, depending on `modal.kind` in the UI store.
 */
export function FileModal() {
  const modal = useFileManagerStore((s) => s.modal)
  const open = useFileManagerStore((s) => s.modalOpen)
  const close = useFileManagerStore((s) => s.closeModal)
  const openDelete = useFileManagerStore((s) => s.openDelete)
  const deleteFile = useDeleteFile()

  if (!modal) return null
  const { kind, file } = modal

  if (kind === 'delete') {
    return (
      <Modal
        open={open}
        onClose={close}
        size="sm"
        icon="alert"
        tone="red"
        title="Delete file?"
        footer={
          <>
            <Button variant="secondary" onClick={close} data-autofocus>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon="trash"
              onClick={() => {
                deleteFile.mutate(file) // optimistic — card disappears right away
                close()
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="confirm__text">
          Are you sure you want to delete <strong>{file.name}</strong>?
        </p>
        <p className="confirm__note">This will free up {formatBytes(file.size)}. This action cannot be undone.</p>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size={file.type === 'pdf' ? 'lg' : 'md'}
      icon={file.icon}
      tone={file.tone}
      title={file.name}
      subtitle={`${formatBytes(file.size)} • ${file.badge}`}
      footer={
        <>
          <Button variant="ghost" icon="trash" onClick={() => openDelete(file)}>
            Delete
          </Button>
          <ButtonLink variant="secondary" icon="download" href={file.url} download={file.name}>
            Download
          </ButtonLink>
          <Button onClick={close}>Close</Button>
        </>
      }
    >
      <FilePreview key={file.id} file={file} />
    </Modal>
  )
}
