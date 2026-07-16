import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import styles from './modal.module.scss'

interface ModalProps {
  trigger: ReactNode
  title: string
  description: string
  children: ReactNode
}

export default function Modal({ trigger, title, description, children }: ModalProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} data-testid="modal-overlay" />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          <Dialog.Description className={styles.description}>{description}</Dialog.Description>
          <Dialog.Close asChild>
            <button type="button" className={styles.close} aria-label="Close">
              <X size={18} aria-hidden="true" />
            </button>
          </Dialog.Close>
          <div className={styles.body}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
