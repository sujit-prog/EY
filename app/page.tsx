import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <header className="w-full border-b bg-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sky-600" />
            <span className="font-semibold tracking-tight text-black">
              Loan Assistant
            </span>
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 px-4 py-10">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black">
              Get a loan decision in minutes, not days.
            </h1>
            <p className="text-black text-sm md:text-base">
              Chat with our AI-powered loan assistant to check eligibility,
              verify your details and complete underwriting in a single,
              guided flow.
            </p>

            <div className="flex gap-3 items-center">
              <Link
                href="/loan/chat"
                className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
              >
                Start Loan Assistant
              </Link>
              <span className="text-xs text-black">
                No paperwork. No branch visit.
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs text-black">
              <div className="rounded-lg border bg-white px-3 py-2">
                <div className="font-semibold text-black">
                  3-step journey
                </div>
                <div>Eligibility → Verification → Offer</div>
              </div>
              <div className="rounded-lg border bg-white px-3 py-2">
                <div className="font-semibold text-black">
                  Realtime checks
                </div>
                <div>KYC & income verification</div>
              </div>
              <div className="rounded-lg border bg-white px-3 py-2">
                <div className="font-semibold text-black">Guided chat</div>
                <div>Clear prompts & explanations</div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            {/* Simple visual mock of the chat */}
            <div className="w-full max-w-xs rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-xs text-black mb-2">Preview</div>
              <div className="space-y-2 text-xs text-black">
                <div className="rounded-2xl bg-slate-100 px-3 py-2 max-w-[80%]">
                  Hi! I’m your loan assistant. Shall we check your eligibility?
                </div>
                <div className="flex justify-end">
                  <div className="rounded-2xl bg-sky-600 text-white px-3 py-2 max-w-[80%]">
                    Yes, let’s start.
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-100 px-3 py-2 max-w-[80%]">
                  Great. Let’s begin with a quick verification.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
