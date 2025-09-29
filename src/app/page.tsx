import CTAButton from '@/components/cta-button'
import GoogleVignetteAd from '@/components/google-vignette-ad'

export default function Home() {

  return (
    <div className="relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="blob blob-blue animate-float-slow" />
        <div className="blob blob-cyan animate-float-medium" />
        <div className="blob blob-indigo animate-float-fast" />
      </div>

      {/* Hero */}
      <section className="pt-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border bg-white/80 backdrop-blur p-8 shadow-md">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Keep your pets in sync.</h1>
            <p className="mt-3 text-lg text-neutral-600">petHub helps families track pees, poops, meds, and more — beautifully and simply.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <CTAButton href="/signup" label="hero_signup" className="px-5 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700">Get started free</CTAButton>
              <CTAButton href="/dashboard" label="hero_view_dashboard" className="px-5 py-2.5 rounded border border-blue-600 text-blue-700 hover:bg-blue-50">View dashboard</CTAButton>
              <CTAButton href="/join" label="hero_join" className="px-5 py-2.5 rounded border hover:bg-white">Join a household</CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-10">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-2xl">💧💩</div>
            <h3 className="text-lg font-semibold mt-2">One-tap logging</h3>
            <p className="text-neutral-600">Track pees, poops, meds, and more with friendly icons and quick actions.</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-2xl">👨‍👩‍👧‍👦</div>
            <h3 className="text-lg font-semibold mt-2">Made for families</h3>
            <p className="text-neutral-600">Invite your household and keep everyone aligned on care routines.</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-2xl">📈</div>
            <h3 className="text-lg font-semibold mt-2">See the trends</h3>
            <p className="text-neutral-600">Spot patterns across days and pets to share better context with your vet.</p>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="mt-10">
        <div className="mx-auto max-w-6xl px-6 rounded-2xl border bg-white p-6 shadow-sm flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Ready to get started?</h2>
            <p className="text-neutral-600">Create your account and add your first pet in under a minute.</p>
          </div>
          <CTAButton href="/signup" label="secondary_signup" className="px-5 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700">Create account</CTAButton>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-10">
        <div className="mx-auto max-w-6xl px-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">How it works</h2>
          <ol className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-700">
            <li className="rounded border bg-white p-4">
              <div className="font-medium">1. Sign up</div>
              <div className="mt-1">Create your account — it takes seconds.</div>
            </li>
            <li className="rounded border bg-white p-4">
              <div className="font-medium">2. Add your pets</div>
              <div className="mt-1">Set up one or many pets with names and details.</div>
            </li>
            <li className="rounded border bg-white p-4">
              <div className="font-medium">3. Invite your household</div>
              <div className="mt-1">Share a link or code so everyone can log together.</div>
            </li>
          </ol>
        </div>
      </section>

      {/* What you can log */}
      <section className="mt-10">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">What you can log</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-neutral-700">
              <li className="border rounded bg-white p-3">💧 Pee</li>
              <li className="border rounded bg-white p-3">💩 Poop</li>
              <li className="border rounded bg-white p-3">💊 Medication</li>
              <li className="border rounded bg-white p-3">🍽️ Feeding</li>
              <li className="border rounded bg-white p-3">🏥 Vet visit</li>
              <li className="border rounded bg-white p-3">🐕 Walk</li>
              <li className="border rounded bg-white p-3">🎾 Play</li>
              <li className="border rounded bg-white p-3">📝 Other</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Household collaboration</h2>
            <p className="mt-2 text-neutral-700">Everyone sees the same timeline so there’s no double feeding, missed meds, or confusion. Assign who performed an action for clear accountability.</p>
          </div>
        </div>
      </section>

      {/* Insights */}
      <section className="mt-10">
        <div className="mx-auto max-w-6xl px-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Insights and history</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-700">
            <div className="rounded border bg-white p-4">📅 Daily summaries</div>
            <div className="rounded border bg-white p-4">⏱️ Time-stamped events</div>
            <div className="rounded border bg-white p-4">👤 Who logged vs who performed</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mt-10">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-lg font-semibold mb-3">Loved by pet families</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <blockquote className="rounded-2xl border bg-white p-6 shadow-sm text-neutral-700">
              "petHub ended the double-feeding chaos in our house."
              <div className="mt-2 font-medium">— Alex & Coco</div>
            </blockquote>
            <blockquote className="rounded-2xl border bg-white p-6 shadow-sm text-neutral-700">
              "The poop timeline helped our vet identify an issue fast."
              <div className="mt-2 font-medium">— Priya & Momo</div>
            </blockquote>
            <blockquote className="rounded-2xl border bg-white p-6 shadow-sm text-neutral-700">
              "We finally know who did the last walk."
              <div className="mt-2 font-medium">— Sam & Teddy</div>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Google Ad */}
      <section className="mt-10">
        <div className="mx-auto max-w-6xl px-6">
          <GoogleVignetteAd />
        </div>
      </section>

      {/* Privacy & control */}
      <section className="mt-10">
        <div className="mx-auto max-w-6xl px-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Privacy & control</h2>
          <p className="mt-2 text-neutral-700">You decide who’s in your household. Remove members at any time, and your data stays within your family.</p>
        </div>
      </section>

      {/* FAQs */}
      <section className="mt-10">
        <div className="mx-auto max-w-6xl px-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">FAQs</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-700">
            <div className="rounded border bg-white p-4">
              <div className="font-medium">Is petHub free?</div>
              <div className="mt-1">Yes, you can start free. We’ll add optional upgrades later.</div>
            </div>
            <div className="rounded border bg-white p-4">
              <div className="font-medium">Can I invite multiple people?</div>
              <div className="mt-1">Absolutely. Invite your whole household.</div>
            </div>
            <div className="rounded border bg-white p-4">
              <div className="font-medium">What devices are supported?</div>
              <div className="mt-1">Any modern browser on desktop or mobile.</div>
            </div>
            <div className="rounded border bg-white p-4">
              <div className="font-medium">Can I export data?</div>
              <div className="mt-1">Export is on our roadmap. Let us know if you need it now.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-10 mb-16">
        <div className="mx-auto max-w-6xl px-6 rounded-2xl border bg-white p-6 shadow-sm flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Your pets will thank you</h2>
            <p className="text-neutral-700">Start logging and reduce the guesswork for your family.</p>
          </div>
          <CTAButton href="/signup" label="final_signup" className="px-5 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700">Start now</CTAButton>
        </div>
      </section>
    </div>
  )
}
