'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Plus, Lightbulb, Paperclip, Image, FileCode,
  ChevronDown, Check, Sparkles, Zap, Brain, Bolt,
  SendHorizontal
} from 'lucide-react'

// INLINE GITHUB SVG
function Github({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

// TYPES
interface Model {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  badge?: string
}

// FIGMA ICON
function FigmaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M8 24C10.208 24 12 22.208 12 20V16H8C5.792 16 4 17.792 4 20C4 22.208 5.792 24 8 24Z" fill="currentColor"/>
      <path d="M4 12C4 9.792 5.792 8 8 8H12V16H8C5.792 16 4 14.208 4 12Z" fill="currentColor"/>
      <path d="M4 4C4 1.792 5.792 0 8 0H12V8H8C5.792 8 4 6.208 4 4Z" fill="currentColor"/>
      <path d="M12 0H16C18.208 0 20 1.792 20 4C20 6.208 18.208 8 16 8H12V0Z" fill="currentColor"/>
      <path d="M20 12C20 14.208 18.208 16 16 16C13.792 16 12 14.208 12 12C12 9.792 13.792 8 16 8C18.208 8 20 9.792 20 12Z" fill="currentColor"/>
    </svg>
  )
}

// MODEL SELECTOR
const models: Model[] = [
  { id: 'sonnet-4.5', name: 'Sonnet 4.5', description: 'Fast & intelligent', icon: <Zap className="size-4 text-blue-400" />, badge: 'Default' },
  { id: 'opus-4.5', name: 'Opus 4.5', description: 'Most capable', icon: <Sparkles className="size-4 text-purple-400" />, badge: 'Pro' },
  { id: 'haiku-4.5', name: 'Haiku 4.5', description: 'Lightning fast', icon: <Brain className="size-4 text-emerald-400" /> },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI flagship', icon: <Sparkles className="size-4 text-green-400" /> },
  { id: 'gemini-2.0', name: 'Gemini 2.0', description: 'Google AI', icon: <Brain className="size-4 text-cyan-400" /> }
]

function ModelSelector({ selectedModel = 'sonnet-4.5', onModelChange }: { 
  selectedModel?: string
  onModelChange?: (model: Model) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(models.find(m => m.id === selectedModel) || models[0])

  const handleSelect = (model: Model) => {
    setSelected(model)
    setIsOpen(false)
    onModelChange?.(model)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 text-[#8a8a8f] hover:text-white hover:bg-white/5 active:scale-95"
      >
        {selected.icon}
        <span>{selected.name}</span>
        <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 z-50 min-w-[220px] bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-1.5">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#5a5a5f]">
                Select Model
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelect(model)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${
                    selected.id === model.id ? 'bg-white/10 text-white' : 'text-[#a0a0a5] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex-shrink-0">{model.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{model.name}</span>
                      {model.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          model.badge === 'Pro' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#6a6a6f]">{model.description}</span>
                  </div>
                  {selected.id === model.id && <Check className="size-4 text-blue-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// CHAT INPUT
function ChatInput({ onSend, placeholder = "What do you want to build?" }: {
  onSend?: (message: string) => void
  placeholder?: string
}) {
  const [message, setMessage] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSubmit = () => {
    if (message.trim()) {
      onSend?.(message)
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative w-full max-w-[680px] mx-auto">
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
      <div className="relative rounded-2xl bg-[#1e1e22] ring-1 ring-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_20px_rgba(0,0,0,0.4)]">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-[15px] text-white placeholder-[#5a5a5f] px-5 pt-5 pb-3 focus:outline-none min-h-[80px] max-h-[200px]"
            style={{ height: '80px' }}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="flex items-center justify-center size-8 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-[#8a8a8f] hover:text-white transition-all duration-200 active:scale-95"
              >
                <Plus className={`size-4 transition-transform duration-200 ${showAttachMenu ? 'rotate-45' : ''}`} />
              </button>

              {showAttachMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
                  <div className="absolute bottom-full left-0 mb-2 z-50 bg-[#1a1a1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="p-1.5 min-w-[180px]">
                      {[
                        { icon: <Paperclip className="size-4" />, label: 'Upload file' },
                        { icon: <Image className="size-4" />, label: 'Add image' },
                        { icon: <FileCode className="size-4" />, label: 'Import code' }
                      ].map((item, i) => (
                        <button key={i} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#a0a0a5] hover:bg-white/5 hover:text-white transition-all duration-150">
                          {item.icon}
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <ModelSelector />
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[#6a6a6f] hover:text-white hover:bg-white/5 transition-all duration-200">
              <Lightbulb className="size-4" />
              <span className="hidden sm:inline">Plan</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[#1488fc] hover:bg-[#1a94ff] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_20px_rgba(20,136,252,0.3)]"
            >
              <span className="hidden sm:inline">Build now</span>
              <SendHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export interface RayBackgroundProps {
  glowColor?: string;
  ringColor1?: string;
  ringColor2?: string;
  ringColor3?: string;
  ringColor4?: string;
}

// Ray Background
export function RayBackground({
  glowColor = "rgba(225, 29, 46, 0.75)",
  ringColor1 = "#f8808d",
  ringColor2 = "#f84242",
  ringColor3 = "#e11d2e",
  ringColor4 = "#8a0c17",
}: RayBackgroundProps) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bg-[#050505] pointer-events-none" />
      <div 
        className="absolute left-1/2 -translate-x-1/2 w-[4000px] h-[1800px] sm:w-[6000px] pointer-events-none"
        style={{
          background: `radial-gradient(circle at center 800px, ${glowColor} 0%, rgba(225, 29, 46, 0.32) 14%, rgba(225, 29, 46, 0.16) 18%, rgba(225, 29, 46, 0.06) 22%, rgba(5, 5, 5, 0.2) 25%)`
        }}
      />
      <div 
        className="absolute top-[175px] left-1/2 w-[1600px] h-[1600px] sm:top-1/2 sm:w-[3043px] sm:h-[2865px] pointer-events-none"
        style={{ transform: 'translate(-50%) rotate(180deg)' }}
      >
        <div className="absolute w-full h-full rounded-full -mt-[13px] pointer-events-none" style={{ background: 'radial-gradient(43.89% 25.74% at 50.02% 97.24%, #120304 0%, #050505 100%)', border: '16px solid white', transform: 'rotate(180deg)', zIndex: 5 }} />
        <div className="absolute w-full h-full rounded-full bg-[#050505] -mt-[11px] pointer-events-none" style={{ border: `23px solid ${ringColor1}`, transform: 'rotate(180deg)', zIndex: 4 }} />
        <div className="absolute w-full h-full rounded-full bg-[#050505] -mt-[8px] pointer-events-none" style={{ border: `23px solid ${ringColor2}`, transform: 'rotate(180deg)', zIndex: 3 }} />
        <div className="absolute w-full h-full rounded-full bg-[#050505] -mt-[4px] pointer-events-none" style={{ border: `23px solid ${ringColor3}`, transform: 'rotate(180deg)', zIndex: 2 }} />
        <div className="absolute w-full h-full rounded-full bg-[#050505] pointer-events-none" style={{ border: `20px solid ${ringColor4}`, boxShadow: '0 -15px 30px rgba(225, 29, 46, 0.65)', transform: 'rotate(180deg)', zIndex: 1 }} />
      </div>
    </div>
  )
}

// ANNOUNCEMENT BADGE COMPONENT
function AnnouncementBadge({ text, href = "#" }: { text: string; href?: string }) {
  const content = (
    <>
      <span className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none opacity-70 mix-blend-overlay" style={{ background: 'radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.15) 0%, transparent 70%)' }} />
      <span className="absolute -top-px left-1/2 -translate-x-1/2 h-[2px] w-[100px] opacity-60" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(37, 119, 255, 0.8) 20%, rgba(126, 93, 225, 0.8) 50%, rgba(59, 130, 246, 0.8) 80%, transparent 100%)', filter: 'blur(0.5px)' }} />
      <Bolt className="size-4 relative z-10 text-white" />
      <span className="relative z-10 text-white font-medium">{text}</span>
    </>
  )

  const className = "relative inline-flex items-center gap-2 px-5 py-2 min-h-[40px] rounded-full text-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
  const style = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    backdropFilter: 'blur(20px) saturate(140%)',
    boxShadow: 'inset 0 1px rgba(255,255,255,0.2), inset 0 -1px rgba(0,0,0,0.1), 0 8px 32px -8px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.08)'
  }

  return href !== '#' ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>{content}</a>
  ) : (
    <button className={className} style={style}>{content}</button>
  )
}

// IMPORT BUTTONS COMPONENT
function ImportButtons({ onImport }: { onImport?: (source: string) => void }) {
  return (
    <div className="flex items-center gap-4 justify-center">
      <span className="text-sm text-[#6a6a6f]">or import from</span>
      <div className="flex gap-2">
        {[
          { id: 'figma', name: 'Figma', icon: <FigmaIcon className="size-4" /> },
          { id: 'github', name: 'GitHub', icon: <Github className="size-4" /> }
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => onImport?.(option.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-[#0f0f0f] hover:bg-[#1a1a1e] text-[#8a8a8f] hover:text-white transition-all duration-200 active:scale-95"
          >
            {option.icon}
            <span>{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// MAIN BOLT CHAT COMPONENT
interface BoltChatProps {
  title?: string
  subtitle?: string
  announcementText?: string
  announcementHref?: string
  placeholder?: string
  onSend?: (message: string) => void
  onImport?: (source: string) => void
}

export function BoltStyleChat({
  title = "What will you",
  subtitle = "Create stunning apps & websites by chatting with AI.",
  announcementText = "Introducing Bolt V2",
  announcementHref = "#",
  placeholder = "What do you want to build?",
  onSend,
  onImport
}: BoltChatProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-[#0f0f0f]">
      <RayBackground />
      <div className="absolute top-[70px]">
        {/* Announcement badge */}
          <AnnouncementBadge text={announcementText} href={announcementHref} />
        </div>
      {/* Content container */}
      <div className="absolute top-[66%] left-1/2 sm:top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full h-full overflow-hidden px-4">
        {/* Title section */}
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-1">
            {title}{' '}
            <span className="bg-gradient-to-b from-[#4da5fc] via-[#4da5fc] to-white bg-clip-text text-transparent italic">
              build
            </span>
            {' '}today?
          </h1>
          <p className="text-base font-semibold sm:text-lg text-[#8a8a8f]">{subtitle}</p>
        </div>

        {/* Chat input */}
        <div className="w-full max-w-[700px] mb-6 sm:mb-8 mt-2">
          <ChatInput placeholder={placeholder} onSend={onSend} />
        </div>

        {/* Import buttons */}
        <ImportButtons onImport={onImport} />
      </div>
    </div>
  )
}

export default BoltStyleChat;
