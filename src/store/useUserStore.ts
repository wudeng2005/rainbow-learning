import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { syncManager } from '@/lib/db/syncManager'

/** 默认内置用户 */
const DEFAULT_USER: User = {
  id: 'rainbow-001',
  name: 'Rainbow',
  avatar: '/avatar.png',
}

interface UserState {
  currentUser: User
  setAvatar: (avatar: string) => void
  setName: (name: string) => void
  /** 用 DB 数据覆盖本地状态 */
  hydrate: (data: { name: string; avatar: string }) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: DEFAULT_USER,

      setAvatar: (avatar: string) => {
        set(state => ({
          currentUser: { ...state.currentUser, avatar },
        }))
        syncManager.syncUserUpdate({ avatar })
      },

      setName: (name: string) => {
        set(state => ({
          currentUser: { ...state.currentUser, name },
        }))
        syncManager.syncUserUpdate({ name })
      },

      hydrate: (data) => {
        set(state => ({
          currentUser: { ...state.currentUser, name: data.name, avatar: data.avatar },
        }))
      },
    }),
    {
      name: 'rainbow-user',
    }
  )
)
