import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../nav-items'
import styles from './mobile-nav.module.scss'

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
}

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className={styles.trigger} aria-label="Open menu">
          <Menu size={24} aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-label="Primary">
          <Dialog.Title className={styles.visuallyHidden}>Navigation menu</Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" className={styles.close} aria-label="Close menu">
              <X size={24} aria-hidden="true" />
            </button>
          </Dialog.Close>
          <ul className={styles.navLinks}>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={navLinkClassName}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
