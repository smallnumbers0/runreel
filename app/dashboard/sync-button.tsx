'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { syncWithStrava } from './actions'

export default function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncWithStrava()
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <form action={handleSync}>
      <button
        type="submit"
        disabled={isSyncing}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync with Strava'}
      </button>
    </form>
  )
}