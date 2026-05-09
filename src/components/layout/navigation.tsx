'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NavKey, NAV_PATHS } from '@/const/navigation'
import { ListIcon, XIcon, ShoppingCartSimpleIcon, FileText } from '@phosphor-icons/react'
import { useTranslations } from 'next-intl'
import { cn } from '@/utils/cn'
import { useCart } from '@/context/cartContext'
import { useQuoteCart } from '@/context/quoteCartContext'

const NAV_KEYS = [
  NavKey.PRODUCT,
  NavKey.SERVICE,
  NavKey.PORTFOLIO,
  NavKey.ABOUT_US,
  NavKey.CONTACT_US,
] as const

export const Navbar = () => {
  const t = useTranslations('Layout')
  const navItems = NAV_KEYS.map((key) => ({
    key,
    href: NAV_PATHS[key],
  }))

  const { totalItems } = useCart()
  const { totalQuoteItems } = useQuoteCart()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-28 bg-base-content">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex min-w-0 w-64 shrink-0 items-center sm:w-80 md:w-96 lg:w-96 scale-125 origin-left"
          >
            <Image
              src="/LogoSK.png"
              alt="SK Sport Trading Co., Ltd."
              width={480}
              height={132}
              className="h-auto w-full max-h-28 object-contain object-left"
              priority
            />
          </Link>

          {/* Desktop full nav — lg and above only */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="body-sm text-primary-content font-medium"
              >
                {t(`links.${item.key}`)}
              </Link>
            ))}

            {mounted && totalQuoteItems > 0 && (
              <Link
                href="/quote-cart"
                className="relative p-2 text-primary-content"
                aria-label="Quote cart"
              >
                <FileText size={32} weight="duotone" />
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-secondary body-sm text-secondary-content font-semibold leading-none">
                  {totalQuoteItems > 99 ? '99+' : totalQuoteItems}
                </span>
              </Link>
            )}

            <Link
              href="/cart"
              className="relative p-2 text-primary-content"
              aria-label="Shopping cart"
            >
              <ShoppingCartSimpleIcon size={32} />
              {mounted && totalItems > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-secondary body-sm text-secondary-content font-semibold leading-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile: quote (when not empty) + hamburger — below md */}
          <div className="md:hidden flex items-center gap-0.5">
            {mounted && totalQuoteItems > 0 && (
              <Link
                href="/quote-cart"
                className="relative p-2 text-primary-content"
                aria-label="Quote cart"
              >
                <FileText size={32} weight="duotone" />
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-secondary body-sm text-secondary-content font-semibold leading-none">
                  {totalQuoteItems > 99 ? '99+' : totalQuoteItems}
                </span>
              </Link>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 text-primary-content"
              type="button"
              aria-label="Open menu"
            >
              <ListIcon size={32} />
            </button>
          </div>

          {/* Tablet compact: quote + cart + hamburger — md to lg only */}
          <div className="hidden md:flex lg:hidden items-center gap-1">
            {mounted && totalQuoteItems > 0 && (
              <Link
                href="/quote-cart"
                className="relative p-2 text-primary-content"
                aria-label="Quote cart"
              >
                <FileText size={32} weight="duotone" />
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-secondary body-sm text-secondary-content font-semibold leading-none">
                  {totalQuoteItems > 99 ? '99+' : totalQuoteItems}
                </span>
              </Link>
            )}
            <Link
              href="/cart"
              className="relative p-2 text-primary-content"
              aria-label="Shopping cart"
            >
              <ShoppingCartSimpleIcon size={32} />
              {mounted && totalItems > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-secondary body-sm text-secondary-content font-semibold leading-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={toggleMenu}
              className="p-2 text-primary-content"
              type="button"
              aria-label="Open menu"
            >
              <ListIcon size={32} />
            </button>
          </div>
        </div>
      </nav>

      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={closeMenu}
      />

      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-1/2 bg-base-content transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex h-28 items-center justify-between gap-2 p-5">
          <button
            type="button"
            onClick={closeMenu}
            className="text-primary-content"
            aria-label="Close menu"
          >
            <XIcon size={32} />
          </button>

          <div className="flex items-center gap-1">
            {mounted && totalQuoteItems > 0 && (
              <Link
                href="/quote-cart"
                onClick={closeMenu}
                className="relative p-2 text-primary-content"
                aria-label="Quote cart"
              >
                <FileText size={32} weight="duotone" />
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-secondary body-sm text-secondary-content font-semibold leading-none">
                  {totalQuoteItems > 99 ? '99+' : totalQuoteItems}
                </span>
              </Link>
            )}
            <Link
              href="/cart"
              onClick={closeMenu}
              className="relative p-2 text-primary-content"
              aria-label="Shopping cart"
            >
              <ShoppingCartSimpleIcon size={32} />
              {mounted && totalItems > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-secondary body-sm text-secondary-content font-semibold leading-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex flex-col w-full">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={closeMenu}
              className="group relative flex items-center w-full px-6 py-5 text-primary-content overflow-hidden transition-all duration-300"
            >
              <span className="absolute inset-0 bg-linear-to-r from-primary/40 from-50% to-secondary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

              <span className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-r from-primary from-20% to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <span className="relative z-10 body-md tracking-wide group-hover:translate-x-2 transition-transform duration-300">
                {t(`links.${item.key}`)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
