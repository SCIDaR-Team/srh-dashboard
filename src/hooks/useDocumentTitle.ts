/**
 * useDocumentTitle — set `document.title` for the lifetime of the page.
 *
 * Restores the previous title on unmount so back-button navigation feels
 * clean. Append the app name for context unless `bare` is passed.
 */

import { useEffect } from 'react'

const APP_NAME = 'SRH Dashboard'

export function useDocumentTitle(title: string, options: { bare?: boolean } = {}) {
  useEffect(() => {
    const prev = document.title
    document.title = options.bare ? title : title ? `${title} · ${APP_NAME}` : APP_NAME
    return () => {
      document.title = prev
    }
  }, [title, options.bare])
}
