import { useState } from 'react'

export function Counter() {
  const [n, setN] = useState(0)
  return (
    <button
      type="button"
      onClick={() => setN((v) => v + 1)}
      className="rounded-md bg-brand px-4 py-2 text-white shadow hover:opacity-90"
    >
      Clicked {n} times (hydration check)
    </button>
  )
}
