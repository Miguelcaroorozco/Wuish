import React from 'react';
import { MessageSquareText, Send } from 'lucide-react';

interface BuzonChatProps {
  messages: any[];
  chatInput: string;
  onChatInputChange: (val: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  chatBottomRef: React.RefObject<HTMLDivElement>;
  user: any;
  className?: string;
}

export const BuzonChat: React.FC<BuzonChatProps> = ({
  messages,
  chatInput,
  onChatInputChange,
  onSendMessage,
  chatBottomRef,
  user,
  className = 'lg:col-span-4',
}) => {
  return (
    <div className={`${className} p-5 rounded-2xl bg-[#1c1b1d] border border-white/5 shadow-xl flex flex-col h-[580px]`}>
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-[#ffd56d]" />
          <h4 className="text-sm font-bold text-white font-display">
            Buzón Rápido &amp; Conversación
          </h4>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ffd56d]/15 text-[#ffd56d] border border-[#ffd56d]/30">
          {messages.length} {messages.length === 1 ? 'Mensaje' : 'Mensajes'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
            <MessageSquareText className="w-8 h-8 text-[#ffd56d]/60 mb-2" />
            <p className="text-sm font-semibold text-white">Canal de Asesoría Directa</p>
            <p className="text-xs text-[#9a907c] mt-1 max-w-xs">
              Envía un mensaje para comunicarte directamente con el equipo técnico y estratégico asignado.
            </p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isFromMe = !msg.es_admin;
            const senderName = msg.es_admin ? 'Equipo WUISH' : (user?.nombres || 'Tú');
            const messageTime = msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
              : '';
            const content = msg.contenido || msg.text || '';

            return (
              <div
                key={msg.id}
                className={`chat-message-bubble flex flex-col ${isFromMe ? 'items-end' : 'items-start'} group`}
              >
                <div className={`flex items-center gap-1.5 mb-1 px-1 ${isFromMe ? 'justify-end' : ''}`}>
                  {!isFromMe && (
                    <div className="w-4 h-4 rounded-full bg-[#ffd56d]/20 border border-[#ffd56d]/50 flex items-center justify-center text-[9px] font-bold text-[#ffd56d]">
                      W
                    </div>
                  )}
                  <span className={`font-semibold text-[11px] ${isFromMe ? 'text-zinc-300' : 'text-[#ffd56d]'}`}>
                    {senderName}
                  </span>
                  {messageTime && <span className="text-[9px] text-[#9a907c]">{messageTime}</span>}
                </div>
                <div
                  className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed text-xs shadow-md ${
                    isFromMe
                      ? 'bg-gradient-to-br from-[#ffd56d] to-[#e6ba4f] text-[#2d2100] font-medium rounded-tr-sm shadow-[#ffd56d]/10'
                      : 'bg-[#242326] text-[#f3f0f2] border border-white/10 rounded-tl-sm shadow-black/20 backdrop-blur-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      <form onSubmit={onSendMessage} className="pt-3 border-t border-white/5 flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          placeholder="Escribe un mensaje para tu equipo asignado..."
          className="flex-1 bg-[#0e0e10] text-[#e5e1e4] placeholder:text-[#9a907c] px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#ffd56d]"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-[#ffd56d] hover:bg-[#ffdf97] text-[#3e2e00] font-bold transition flex items-center justify-center shrink-0 cursor-pointer shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
