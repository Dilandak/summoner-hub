import { useEffect, useState } from 'react'

export function useMinimumLoading(isLoading: boolean, minMs = 1800) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    if (isLoading) {
      setShow(true)
      return
    }

    timeout = setTimeout(() => {
      setShow(false)
    }, minMs)

    return () => clearTimeout(timeout)
  }, [isLoading, minMs])

  return show
}