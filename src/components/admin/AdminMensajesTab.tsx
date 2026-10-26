import React from 'react';
import { Search, Send } from 'lucide-react';

interface AdminMensajesTabProps {
  conversations: any[];
  searchMsgTerm: string;
  onSearchMsgChange: (term: string) => void;
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
  activeClient: any;
  activeChatMessages: any[];
  adminReplyText: string;
  onReplyTextChange: (text: string) => void;
  onSendReply: (e: React.FormEvent) => void;
  sendingReply: boolean;
  chatBottomRef: React.RefObject<HTMLDivElement>;
}

export const AdminMensajesTab: React.FC<AdminMensajesTabProps> = ({
  conversations,
  searchMsgTerm,
  onSearchMsgChange,
  selectedClientId,
  onSelectClient,
  activeClient,
  activeChatMessages,
  adminReplyText,
  onReplyTextChange,
  onSendReply,
  sendingReply,
  chatBottomRef,
}) => {
  const filteredConversations = conversations.filter((c) =>
    c.userName.toLowerCase().includes(searchMsgTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-4 rounded-2xl bg-[#1c1b1d] border border-white/5 p-4 space-y-3">
        <h3 className="text-sm font-bold text-white font-display">Bandeja de Clientes</h3>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchMsgTerm}
            onChange={(e) => onSearchMsgChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0e0e10] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#ffd56d]"
          />
        </div>
        <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9a907c]">Sin mensajes.</div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.userId}
                onClick={() => onSelectClient(conv.userId)}
                className={`p-3 rounded-xl transition cursor-pointer border ${
                  conv.userId === selectedClientId
                    ? 'bg-[#ffd56d]/15 border-[#ffd56d]/40 text-white'
                    : 'bg-[#201f21] border-transparent hover:border-white/10 text-[#d1c5af]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white truncate">{conv.userName}</span>
                  <span className="text-[10px] text-[#9a907c]">{conv.lastTime}</span>
                </div>
                <p className="text-[11px] text-[#9a907c] truncate mt-1">{conv.lastMessage}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-8 rounded-2xl bg-[#1c1b1d] border border-white/5 p-5 flex flex-col h-[560px]">
        {activeClient ? (
          <>
            <div className="pb-3 border-b border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{activeClient.userName}</h4>
                <span className="text-[11px] text-[#9a907c]">{activeClient.userEmail}</span>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#ffd56d]/10 text-[#ffd56d] font-semibold border border-[#ffd56d]/30">
                {activeChatMessages.length} mensajes
              </span>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {activeChatMessages.map((m) => {
                const isFromAdmin = m.es_admin;
                const senderName = isFromAdmin ? 'Equipo WUISH (Tú)' : activeClient.userName;
                const messageTime = new Date(m.created_at).toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={m.id}
                    className={`chat-message-bubble flex flex-col ${
                      isFromAdmin ? 'items-end' : 'items-start'
                    } group`}
                  >
                    <div
                      className={`flex items-center gap-1.5 mb-1 px-1 ${
                        isFromAdmin ? 'justify-end' : ''
                      }`}
                    >
                      {!isFromAdmin && (
                        <div className="w-4 h-4 rounded-full bg-zinc-700/60 border border-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-300">
                          {activeClient.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span
                        className={`text-[11px] font-semibold ${
                          isFromAdmin ? 'text-[#ffd56d]' : 'text-zinc-300'
                        }`}
                      >
                        {senderName}
                      </span>
                      <span className="text-[9px] text-[#9a907c]">{messageTime}</span>
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-md ${
                        isFromAdmin
                          ? 'bg-gradient-to-br from-[#ffd56d] to-[#e6ba4f] text-[#2d2100] font-medium rounded-tr-sm shadow-[#ffd56d]/10'
                          : 'bg-[#242326] text-[#f3f0f2] border border-white/10 rounded-tl-sm shadow-black/20 backdrop-blur-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={onSendReply} className="pt-3 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={adminReplyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                placeholder={`Responder a ${activeClient.userName}...`}
                className="flex-1 bg-[#0e0e10] text-white px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
              />
              <button
                type="submit"
                disabled={sendingReply}
                className="px-4 py-2.5 rounded-xl bg-[#ffd56d] text-[#3e2e00] font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sendingReply ? '...' : 'Enviar'}</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-[#9a907c] text-xs">
            Selecciona una conversación para responder.
          </div>
        )}
      </div>
    </div>
  );
};
