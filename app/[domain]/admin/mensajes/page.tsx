import { ChatView } from "../_components/chat-view"

export default function MensajesPage() {
  return (
    // 1. Quitamos el texto de "Mensajes WA"
    // 2. Usamos calc(100vh - 4.5rem) para restar exactamente la altura de tu barra superior (TopBar)
    // 3. overflow-hidden garantiza que bajo NINGUNA circunstancia aparezca scroll en la página entera
    <div className="h-[calc(100vh-4.5rem)] w-full p-2 sm:p-4 overflow-hidden bg-zinc-50/50">
      <ChatView />
    </div>
  )
}