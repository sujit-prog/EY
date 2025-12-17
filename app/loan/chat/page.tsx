'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatShell } from '@/components/chat/ChatShell'

type Role = 'user' | 'assistant' | 'system'
type Stage = 'welcome' | 'phone_request' | 'otp_verification' | 'discovery' | 'sales' | 'verification' | 'underwriting' | 'sanctioned'

interface ChatMessage {
  id: string
  role: Role
  content: string
  timestamp?: string
  isError?: boolean
  agentLabel?: string
}

interface OfferLetter {
  fileName: string
  contentBase64: string
}

export default function ChatPage() {
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('chat_session_id')
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('chat_session_id', id)
      }
      return id
    }
    return 'default_session'
  })

  const load = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  }

  const save = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  const [messages, setMessages] = useState<ChatMessage[]>(() => 
    load('chat_messages', [])
  )

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStage, setCurrentStage] = useState<Stage>(() => 
    load('chat_stage', 'welcome')
  )

  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [requireSalarySlip, setRequireSalarySlip] = useState(false)
  const [documentsUploaded, setDocumentsUploaded] = useState({
    aadhaar: false,
    pan: false,
    salary_slip: false
  })

  const [offerLetter, setOfferLetter] = useState<OfferLetter | null>(null)
  const [lowLevelError, setLowLevelError] = useState<string | null>(null)
  const [agentTransition, setAgentTransition] = useState<string | null>(null)
  const [storedPhone, setStoredPhone] = useState<string | null>(() => 
    load('user_phone', null)
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)
  const underwritingProcessed = useRef(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    save('chat_messages', messages)
    save('chat_stage', currentStage)
  }, [messages, currentStage])

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    if (messages.length === 0) {
      sendMessage('Hello', true)
    }
  }, [])

  const getSuggestions = () => {
    switch (currentStage) {
      case 'welcome':
      case 'phone_request':
        return []
      case 'otp_verification':
        return []
      case 'discovery':
        return ['I need a loan', 'I need ₹3 lakhs for education', 'Home renovation']
      case 'sales':
        return ['Can we do 36 months?', 'What about 60 months?', 'Okay, let\'s proceed']
      case 'verification':
        return ['Why do you need these?', 'Is my data secure?']
      case 'underwriting':
        return []
      default:
        return []
    }
  }

  const sendMessage = async (text?: string, isInitial = false) => {
    const messageText = text || input.trim()
    if (!messageText || isLoading) return

    setLowLevelError(null)
    setAgentTransition(null)

    if (!isInitial) {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: messageText,
        timestamp: new Date().toLocaleTimeString()
      }
      setMessages(prev => [...prev, userMsg])
    }

    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          sessionId,
          phone: storedPhone
        })
      })

      if (!res.ok) throw new Error('Network error')

      const data = await res.json()

      if (data.silentAck) {
        setMessages(prev => prev.slice(0, -1))
        setIsLoading(false)
        return
      }

      const getAgentLabel = (stage: Stage) => {
        switch (stage) {
          case 'welcome':
          case 'phone_request':
          case 'otp_verification':
          case 'discovery':
          case 'sanctioned':
            return 'Master Agent'
          case 'sales':
            return 'Sales Agent'
          case 'verification':
            return 'Verification Agent'
          case 'underwriting':
            return 'Underwriting Agent'
          default:
            return 'Agent'
        }
      }

      if (data.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString(),
            agentLabel: getAgentLabel(data.stage || currentStage)
          }
        ])
      }

      if (data.stage) {
        setCurrentStage(data.stage)
      }
      
      if (data.nextStage) {
        setCurrentStage(data.nextStage)
      }
      
      if (data.agentTransition) {
        setAgentTransition(data.agentTransition)
        setTimeout(() => setAgentTransition(null), 3000)
      }

      if (data.showDocumentUpload) {
        setTimeout(() => {
          setShowDocumentUpload(true)
          setRequireSalarySlip(data.requireSalarySlip || false)
        }, 800)
      }

      if (data.skipPhoneCollection && data.userProfile) {
        setStoredPhone(data.userProfile.phone)
        save('user_phone', data.userProfile.phone)
      }

      if (data.offerLetter) {
        setOfferLetter(data.offerLetter)
      }

    } catch (error) {
      setLowLevelError('Something went wrong. Please try again.')
      console.error('Chat error:', error)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    const requiredDocs = requireSalarySlip 
      ? ['aadhaar', 'pan', 'salary_slip']
      : ['aadhaar', 'pan']
    
    const allRequiredDocsUploaded = requiredDocs.every(doc => 
      documentsUploaded[doc as keyof typeof documentsUploaded]
    )
    
    if (allRequiredDocsUploaded && currentStage === 'verification' && showDocumentUpload && !underwritingProcessed.current) {
      console.log('📄 All documents uploaded, transitioning to underwriting...')
      
      underwritingProcessed.current = true
      
      setShowDocumentUpload(false)
      
      setAgentTransition("Routing to Underwriting Agent")
      setTimeout(() => setAgentTransition(null), 3000)
      
      const processingMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Documents received. Processing your application...",
        timestamp: new Date().toLocaleTimeString(),
        agentLabel: 'Underwriting Agent'
      }
      setMessages(prev => [...prev, processingMsg])
      
      setCurrentStage('underwriting')
      
      setTimeout(() => processUnderwriting(), 1500)
    }
  }, [documentsUploaded, currentStage, showDocumentUpload, requireSalarySlip])

  const processUnderwriting = async () => {
    console.log('🔄 Processing underwriting...', {
      sessionId,
      storedPhone,
      salarySlipUploaded: documentsUploaded.salary_slip
    })
    
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'process_underwriting',
          sessionId,
          phone: storedPhone,
          salarySlipUploaded: documentsUploaded.salary_slip
        })
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      console.log('✅ Underwriting response:', data)

      if (data.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString(),
            agentLabel: data.stage === 'sanctioned' ? 'Master Agent' : 'Underwriting Agent'
          }
        ])
      }

      if (data.stage) {
        setCurrentStage(data.stage)
      }

      if (data.nextStage) {
        setCurrentStage(data.nextStage)
      }

      if (data.offerLetter) {
        setOfferLetter(data.offerLetter)
      }

      if (data.agentTransition) {
        setAgentTransition(data.agentTransition)
        setTimeout(() => setAgentTransition(null), 3000)
      }
    } catch (error) {
      console.error('❌ Underwriting failed:', error)
      setLowLevelError('Underwriting failed. Please try again.')
    }
    
    setIsLoading(false)
  }

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

  return (
    <div className="relative">
      {agentTransition && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm animate-fade-in">
          🔄 {agentTransition}
        </div>
      )}

      <ChatShell
        messages={messages}
        input={input}
        setInput={setInput}
        sendMessage={() => sendMessage()}
        isLoading={isLoading}
        suggestions={getSuggestions()}
        onSuggestionClick={setInput}
        currentStage={currentStage}
        lowLevelError={lowLevelError}
      />

      {showDocumentUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl border border-slate-700">
            <h3 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">📄</span>
              Upload Required Documents
            </h3>

            <p className="text-sm text-slate-300 mb-4">
              Please upload your KYC documents to proceed with verification.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                  {documentsUploaded.aadhaar ? (
                    <span className="text-2xl">✅</span>
                  ) : (
                    <span className="text-2xl">📎</span>
                  )}
                  <span className="text-sm text-slate-200 font-medium">
                    Aadhaar Card
                  </span>
                </div>

                <label>
                  <input
                    type="file"
                    hidden
                    accept="image/*,.pdf"
                    disabled={documentsUploaded.aadhaar}
                    onChange={() =>
                      setDocumentsUploaded(prev => ({
                        ...prev,
                        aadhaar: true
                      }))
                    }
                  />
                  <span className={`cursor-pointer text-xs px-3 py-1 rounded-full ${
                    documentsUploaded.aadhaar
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                  }`}>
                    {documentsUploaded.aadhaar ? 'Uploaded' : 'Upload'}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                  {documentsUploaded.pan ? (
                    <span className="text-2xl">✅</span>
                  ) : (
                    <span className="text-2xl">📎</span>
                  )}
                  <span className="text-sm text-slate-200 font-medium">
                    PAN Card
                  </span>
                </div>

                <label>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    disabled={documentsUploaded.pan}
                    onChange={() =>
                      setDocumentsUploaded(prev => ({
                        ...prev,
                        pan: true
                      }))
                    }
                  />
                  <span className={`cursor-pointer text-xs px-3 py-1 rounded-full ${
                    documentsUploaded.pan
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                  }`}>
                    {documentsUploaded.pan ? 'Uploaded' : 'Upload'}
                  </span>
                </label>
              </div>

              {requireSalarySlip && (
                <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <div className="flex items-center gap-3">
                    {documentsUploaded.salary_slip ? (
                      <span className="text-2xl">✅</span>
                    ) : (
                      <span className="text-2xl">📎</span>
                    )}
                    <div>
                      <span className="text-sm text-slate-200 font-medium block">
                        Latest Salary Slip
                      </span>
                      <span className="text-[10px] text-amber-300">
                        Required (amount exceeds limit)
                      </span>
                    </div>
                  </div>

                  <label>
                    <input
                      type="file"
                      hidden
                      accept=".pdf"
                      disabled={documentsUploaded.salary_slip}
                      onChange={() =>
                        setDocumentsUploaded(prev => ({
                          ...prev,
                          salary_slip: true
                        }))
                      }
                    />
                    <span className={`cursor-pointer text-xs px-3 py-1 rounded-full ${
                      documentsUploaded.salary_slip
                        ? 'bg-emerald-500/20 text-emerald-300' 
                        : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                    }`}>
                      {documentsUploaded.salary_slip ? 'Uploaded' : 'Upload'}
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-slate-400 flex items-start gap-2">
              <span>🔒</span>
              <span>Your documents are encrypted with bank-grade security.</span>
            </div>
          </div>
        </div>
      )}

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