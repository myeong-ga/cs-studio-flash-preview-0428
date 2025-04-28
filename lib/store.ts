import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { FileState } from "./types"

export type FileStatus = {
  name: string
  status: FileState
  fileId?: string
  error?: string
}

type CacheState = {
  isCreated: boolean
  cacheName: string | null
  lastValidated: number | null // Timestamp of last validation
}

type StoreState = {
  files: FileStatus[]
  uploadComplete: boolean
  cache: CacheState
  addFile: (file: FileStatus) => void
  updateFileStatus: (name: string, status: FileState, fileId?: string, error?: string) => void
  setUploadComplete: (complete: boolean) => void
  resetFiles: () => void
  setCacheCreated: (created: boolean, cacheName?: string) => void
  setCacheValidated: (timestamp: number) => void
  resetCache: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      files: [],
      uploadComplete: false,
      cache: {
        isCreated: false,
        cacheName: null,
        lastValidated: null,
      },
      addFile: (file) =>
        set((state) => ({
          files: [...state.files, file],
        })),
      updateFileStatus: (name, status, fileId, error) =>
        set((state) => ({
          files: state.files.map((file) =>
            file.name === name ? { ...file, status, fileId: fileId || file.fileId, error: error || file.error } : file,
          ),
        })),
      setUploadComplete: (complete) => set({ uploadComplete: complete }),
      resetFiles: () => set({ files: [], uploadComplete: false }),
      setCacheCreated: (created, cacheName) =>
        set((state) => ({
          cache: {
            isCreated: created,
            cacheName: cacheName || state.cache.cacheName,
            lastValidated: created ? Date.now() : state.cache.lastValidated,
          },
        })),
      setCacheValidated: (timestamp) =>
        set((state) => ({
          cache: {
            ...state.cache,
            lastValidated: timestamp,
          },
        })),
      resetCache: () =>
        set({
          cache: {
            isCreated: false,
            cacheName: null,
            lastValidated: null,
          },
        }),
    }),
    {
      name: "google-genai-cache-storage",
    },
  ),
)
