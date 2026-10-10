import Modal from './Modal'
import GlassButton from './GlassButton'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-gray-400 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <GlassButton variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </GlassButton>
        <GlassButton variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </GlassButton>
      </div>
    </Modal>
  )
}
