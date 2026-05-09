'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { MinusIcon, PlusIcon, TrashIcon, FileText } from '@phosphor-icons/react'
import { useQuoteCart } from '@/context/quoteCartContext'

export default function QuoteCartPage() {
  const { items, totalQuoteItems, updateQuantity, removeItem, clearQuoteCart } = useQuoteCart()

  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return (
      items.length > 0 &&
      customerName.trim() !== '' &&
      email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    )
  }, [items.length, customerName, email])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!canSubmit) {
      setError('Please enter your name, a valid email, and keep at least one product in your list.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          companyName: companyName.trim() || undefined,
          message: message.trim() || undefined,
          items: items.map((i) => ({
            id: i.id,
            slug: i.slug,
            quantity: i.quantity,
          })),
        }),
      })

      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>

      if (
        !res.ok ||
        !data ||
        data.success !== true ||
        typeof data.quoteRequestId !== 'string' ||
        data.quoteRequestId.trim() === ''
      ) {
        const err = data.error
        const msg =
          typeof err === 'string' && err.trim() !== ''
            ? err.trim()
            : 'Your quote request could not be sent. Please try again.'
        setError(msg)
        return
      }

      clearQuoteCart()
      setSuccessId(data.quoteRequestId)
      setCustomerName('')
      setEmail('')
      setPhone('')
      setCompanyName('')
      setMessage('')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (successId) {
    return (
      <main className="flex w-full flex-col items-center">
        <section className="section-bg-to-right w-full py-16 md:py-24">
          <div className="relative z-10 container mx-auto flex max-w-2xl flex-col gap-4 px-6 text-center">
            <h1 className="text-primary-content">Quote request sent</h1>
            <p className="body-sm text-primary-content/90">
              Thank you. Your reference ID: <span className="font-mono text-sm">{successId}</span>
            </p>
            <p className="body-sm text-primary-content/80">
              We will get back to you as soon as possible.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/product"
                className="btn btn-gradient-solid-border btn-lg btn-lg-typo px-8"
              >
                <span className="text-primary">Browse products</span>
              </Link>
              <Link
                href="/"
                className="body-sm text-primary-content/90 underline-offset-2 hover:underline"
              >
                Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="flex w-full flex-col items-center">
      <section className="section-bg-to-right w-full py-16 md:py-24">
        <div className="relative z-10 container mx-auto px-6 flex flex-col gap-3">
          <h1 className="text-primary-content">Quote cart</h1>
          {totalQuoteItems > 0 && (
            <p className="body-sm text-primary-content/80">
              {totalQuoteItems} {totalQuoteItems === 1 ? 'item' : 'items'} for your quote request
            </p>
          )}
        </div>
      </section>

      <div className="flex w-full flex-col items-center justify-center bg-header-bg">
        <div className="container mx-auto px-6 py-10 md:py-16">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-6 py-16 text-center">
              <FileText size={56} className="text-subtle" weight="duotone" />
              <p className="body-sm text-subtle">Your quote cart is empty.</p>
              <Link
                href="/product"
                className="btn btn-gradient-solid-border btn-lg btn-lg-typo px-8"
              >
                <span className="text-primary">Browse products</span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
              <div className="flex flex-1 flex-col gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-box border border-base-300 bg-primary-content px-5 py-4 shadow-sm"
                  >
                    <div className="shrink-0 h-20 w-20 overflow-hidden rounded-box border border-base-300 bg-base-200">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileText size={20} className="text-subtle" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      {item.category && (
                        <span className="body-sm text-primary font-semibold uppercase tracking-widest">
                          {item.category}
                        </span>
                      )}
                      <h3 className="text-base-content leading-snug">{item.title}</h3>
                      {item.subtitle && <p className="body-sm text-subtle">{item.subtitle}</p>}
                      <p className="body-sm mt-1 text-subtle">Quote — pricing on request</p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-3">
                      <div className="flex items-center gap-2 rounded-box border border-base-300 bg-base-100 px-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-base-content transition-colors hover:bg-base-200 hover:text-primary"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon size={14} />
                        </button>
                        <span className="body-sm w-6 text-center font-medium text-base-content">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-base-content transition-colors hover:bg-base-200 hover:text-primary"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex cursor-pointer items-center gap-1 rounded body-sm text-subtle transition-colors hover:opacity-80 hover:text-error"
                        aria-label="Remove item"
                      >
                        <TrashIcon size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={clearQuoteCart}
                    className="body-sm text-subtle underline-offset-2 hover:underline transition-colors hover:text-error"
                  >
                    Clear all items
                  </button>
                </div>
              </div>

              <div className="w-full lg:w-[min(100%,28rem)] shrink-0">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4 rounded-box border border-base-300 bg-primary-content px-6 py-6 shadow-sm"
                >
                  <h2 className="text-primary">Request a quote</h2>
                  <div className="h-0.5 w-12 bg-gradient" />
                  <p className="body-sm text-subtle leading-relaxed">
                    Send your selected products to our team. We will respond with pricing and
                    availability.
                  </p>

                  {error ? (
                    <p className="body-sm text-error" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <label className="flex flex-col gap-1 body-sm text-base-content">
                    <span>Full name *</span>
                    <input
                      type="text"
                      name="customerName"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      autoComplete="name"
                      disabled={submitting}
                      className="rounded-box border border-base-300 bg-base-100 px-3 py-2 outline-none focus:border-primary/50"
                    />
                  </label>
                  <label className="flex flex-col gap-1 body-sm text-base-content">
                    <span>Email *</span>
                    <input
                      type="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      disabled={submitting}
                      className="rounded-box border border-base-300 bg-base-100 px-3 py-2 outline-none focus:border-primary/50"
                    />
                  </label>
                  <label className="flex flex-col gap-1 body-sm text-base-content">
                    <span>Phone</span>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      disabled={submitting}
                      className="rounded-box border border-base-300 bg-base-100 px-3 py-2 outline-none focus:border-primary/50"
                    />
                  </label>
                  <label className="flex flex-col gap-1 body-sm text-base-content">
                    <span>Company</span>
                    <input
                      type="text"
                      name="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      autoComplete="organization"
                      disabled={submitting}
                      className="rounded-box border border-base-300 bg-base-100 px-3 py-2 outline-none focus:border-primary/50"
                    />
                  </label>
                  <label className="flex flex-col gap-1 body-sm text-base-content">
                    <span>Message</span>
                    <textarea
                      name="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      disabled={submitting}
                      className="rounded-box border border-base-300 bg-base-100 px-3 py-2 outline-none focus:border-primary/50"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={submitting || !canSubmit}
                    className="btn btn-gradient-solid-border btn-lg btn-lg-typo w-full text-center disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="text-primary">Sending…</span>
                    ) : (
                      <span className="text-primary">Submit quote request</span>
                    )}
                  </button>

                  <Link
                    href="/product"
                    className="body-sm text-center text-subtle underline-offset-2 hover:underline"
                  >
                    Continue browsing
                  </Link>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
