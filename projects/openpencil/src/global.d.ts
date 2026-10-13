export {}

declare global {
  interface GestureEvent extends UIEvent {
    scale: number
    rotation: number
    clientX: number
    clientY: number
  }

  interface FilePickerAcceptType {
    description: string
    accept: Record<string, string[]>
  }

  interface FilePickerOptions {
    multiple?: boolean
    types?: FilePickerAcceptType[]
    suggestedName?: string
  }

  interface Window {
    showOpenFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle[]>
    showSaveFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle>
    showDirectoryPicker?(options?: {
      id?: string
      mode?: 'read' | 'readwrite'
    }): Promise<FileSystemDirectoryHandle>
    queryLocalFonts?(): Promise<
      {
        family: string
        fullName: string
        style: string
        postscriptName: string
        blob(): Promise<Blob>
      }[]
    >
    mockWindowOpen?(url: string): void
  }
}
