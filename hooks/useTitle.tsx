import { useEffect } from 'react'

const useTitle = (title: string) => {
  const label = process.env.NEXT_PUBLIC_SITE_NAME ?? ''
  useEffect(() => {
    document.title = document.title = title ? `${label} | ${title}` : label
  }, [title])
}

export default useTitle
