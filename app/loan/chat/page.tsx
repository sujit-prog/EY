// loan/chat/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatShell } from '@/components/chat/ChatShell'

/* ---------------- TYPES ---------------- */
type Role = 'user' | 'assistant' | 'system'
type Stage = 'discovery' | 'sales' | 'verification' | 'underwriting' | 'sanctioned'

interface ChatMessage {
  id: string
  role: Role
  content: string
  timestamp?: string
  isError?: boolean
  agentLabel?: string
}

interface VerificationDoc {
  id: string
  label: string
  required: boolean
  allowedTypes: string[]
  uploaded: boolean
}

interface OfferLetter {
  fileName: string
  contentBase64: string
}

/* ---------------- COMPONENT ---------------- */
export default function ChatPage() {
  /* ---------- LOCAL MEMORY ---------- */
  const load = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
  }

  const save = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  /* ---------- STATE ---------- */
  const [messages, setMessages] = useState<ChatMessage[]>(
    load('chat_messages', [
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Hello! Welcome to the Tata Capital Personal Loan Assistant. How may I assist you with your financial needs today?',
        timestamp: new Date().toLocaleTimeString(),
        agentLabel: 'Master Agent'
      }
    ])
  )

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStage, setCurrentStage] = useState<Stage>(
    load('chat_stage', 'discovery')
  )

  const [verificationDocs, setVerificationDocs] =
    useState<VerificationDoc[] | null>(null)

  const [offerLetter, setOfferLetter] =
    useState<OfferLetter | null>(null)

  const [lowLevelError, setLowLevelError] =
    useState<string | null>(null)

  const [agentTransition, setAgentTransition] =
    useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  /* ---------- AUTO SCROLL ---------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ---------- SAVE MEMORY ---------- */
  useEffect(() => {
    save('chat_messages', messages)
    save('chat_stage', currentStage)
  }, [messages, currentStage])

  /* ---------- STAGE-AWARE SUGGESTIONS ---------- */
  const getSuggestions = () => {
    switch (currentStage) {
      case 'discovery':
        return ['I need a loan', 'Personal loan for ₹3 lakhs', 'Education loan']
      case 'sales':
        return ["Can I see a shorter tenure?', 'What's the total cost?', 'Yes, let's proceed"]
      case 'verification':
        return ['Why do you need these documents?', 'Is my data secure?']
      case 'underwriting':
        return ['How long will this take?', 'What are you checking?']
      default:
        return []
    }
  }

  /* ---------- SEND MESSAGE ---------- */
  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    setLowLevelError(null)
    setAgentTransition(null)

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          stage: currentStage,
          phone: '9876543210'
        })
      })

      if (!res.ok) throw new Error()

      const data = await res.json()

      // Determine agent label based on stage
      const getAgentLabel = (stage: Stage) => {
        switch (stage) {
          case 'discovery': return 'Master Agent'
          case 'sales': return 'Sales Agent'
          case 'verification': return 'Verification Agent'
          case 'underwriting': return 'Underwriting Agent'
          case 'sanctioned': return 'Master Agent'
          default: return 'Agent'
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString(),
          agentLabel: getAgentLabel(data.nextStage || currentStage)
        }
      ])

      if (data.nextStage) {
        setCurrentStage(data.nextStage)
        
        // Show agent transition notification
        if (data.agentTransition) {
          setAgentTransition(data.agentTransition)
          setTimeout(() => setAgentTransition(null), 3000)
        }
      }
      
      if (data.verificationDocs) setVerificationDocs(data.verificationDocs)
      if (data.offerLetter) setOfferLetter(data.offerLetter)

    } catch {
      setLowLevelError('Something went wrong. Please try again.')
    }

    setIsLoading(false)
  }

  /* ---------- AUTO MOVE AFTER DOC UPLOAD ---------- */
  useEffect(() => {
    if (
      currentStage === 'verification' &&
      verificationDocs?.every(d => d.uploaded)
    ) {
      // Simulate document verification
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Identity Verified ✅ Thank you. We are now checking your eligibility...',
            timestamp: new Date().toLocaleTimeString(),
            agentLabel: 'Verification Agent'
          }
        ])

        setCurrentStage('underwriting')
        setVerificationDocs(null)

        // Simulate underwriting process
        setTimeout(async () => {
          try {
            const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: 'start_underwriting',
                stage: 'underwriting',
                phone: '9876543210'
              })
            })

            const data = await res.json()

            setMessages(prev => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.reply,
                timestamp: new Date().toLocaleTimeString(),
                agentLabel: 'Underwriting Agent'
              }
            ])

            if (data.offerLetter) {
              setCurrentStage('sanctioned')
              setOfferLetter(data.offerLetter)
            }
          } catch {
            setLowLevelError('Underwriting failed. Please try again.')
          }
        }, 2000)
      }, 1000)
    }
  }, [verificationDocs, currentStage])

  /* ---------- PDF DOWNLOAD ---------- */
  const downloadOfferLetter = () => {
    if (!offerLetter) return

    const binary = atob(offerLetter.contentBase64)
    const bytes = new Uint8Array(binary.length)

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = offerLetter.fileName
    a.click()

    URL.revokeObjectURL(url)
  }

  /* ---------- UI ---------- */
  return (
    <div className="relative">
      {/* Agent Transition Notification */}
      {agentTransition && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm animate-fade-in">
          🔄 {agentTransition}
        </div>
      )}

      <ChatShell
        messages={messages}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        isLoading={isLoading}
        suggestions={getSuggestions()}
        onSuggestionClick={setInput}
        currentStage={currentStage}
        lowLevelError={lowLevelError}
      />

      {/* ---------- DOCUMENT UPLOAD MODAL ---------- */}
      {currentStage === 'verification' && verificationDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl border border-slate-700">
            <h3 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">📄</span>
              Upload Required Documents
            </h3>

            <p className="text-sm text-slate-300 mb-4">
              Please upload the following documents to verify your identity and proceed with the loan application.
            </p>

            <div className="space-y-3">
              {verificationDocs.map(doc => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    {doc.uploaded ? (
                      <span className="text-2xl">✅</span>
                    ) : (
                      <span className="text-2xl">📎</span>
                    )}
                    <span className="text-sm text-slate-200 font-medium">
                      {doc.label}
                    </span>
                  </div>

                  <label>
                    <input
                      type="file"
                      hidden
                      accept={doc.allowedTypes.join(',')}
                      disabled={doc.uploaded}
                      onChange={() =>
                        setVerificationDocs(prev =>
                          prev!.map(d =>
                            d.id === doc.id
                              ? { ...d, uploaded: true }
                              : d
                          )
                        )
                      }
                    />
                    <span className={`cursor-pointer text-xs px-3 py-1 rounded-full ${
                      doc.uploaded 
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                    }`}>
                      {doc.uploaded ? 'Uploaded' : 'Upload'}
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-slate-400 flex items-start gap-2">
              <span>🔒</span>
              <span>Your documents are encrypted and secure. We use industry-standard security protocols.</span>
            </div>
          </div>
        </div>
      )}

      {/* ---------- OFFER LETTER MODAL ---------- */}
      {currentStage === 'sanctioned' && offerLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-800 p-8 shadow-2xl border border-emerald-600">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Loan Approved!
              </h3>
              <p className="text-emerald-100 text-sm">
                Your loan application has been successfully approved. Download your official sanction letter below.
              </p>
            </div>

            <button
              onClick={downloadOfferLetter}
              className="w-full rounded-full bg-white py-3 text-emerald-900 font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg"
            >
              📥 Download Sanction Letter
            </button>

            <p className="mt-4 text-xs text-emerald-100 text-center">
              Loan ID: TCAP{Date.now().toString().slice(-6)}
            </p>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}