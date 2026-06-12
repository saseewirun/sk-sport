'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { PhoneIcon, EmailIcon } from '@/components/icons'
import { socialLinks } from '@/components/common'
import { CONTACT } from '@/const/contact'

export const Footer: React.FC = () => {
  const router = useRouter()
  const t = useTranslations('Layout')

  const siteMapLinks = [
    { label: t('links.home'), href: '/' },
    { label: t('links.aboutUs'), href: '/about' },
    { label: t('links.product'), href: '/product' },
    { label: t('links.service'), href: '/service' },
    { label: t('links.portfolio'), href: '/portfolio' },
    { label: t('links.faq'), href: '/faq' },
  ]

  const legalLinks = [
    { label: t('links.privacyPolicy'), href: '/privacy-policy' },
    { label: t('links.termsOfService'), href: '/terms' },
  ]

  return (
    <footer className="section-bg-to-right w-full min-h-112.5 overflow-hidden">
      {/* Content */}
      <div className="relative z-10 container mx-auto w-full px-4 py-12 lg:py-18">
        <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-20 w-full justify-between">
          <div className="flex flex-col gap-5 lg:max-w-125 flex-1">
            <h3 className="tracking-wider">
              <span className="company-name-part1">{t('companyNamePart1')} </span>
              <span className="company-name-part2">{t('companyNamePart2')}</span>
            </h3>

            {/* Description */}
            <p className="body-sm text-primary-content/60 mb-2">{t('description')}</p>

            {/* Social icons */}
            <div className="flex items-center gap-6 mb-5">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="social-icon-bg flex items-center justify-center w-9 h-9 rounded-full border border-primary-content/30 text-primary-content/70 transition-all duration-300 hover:border-primary-content hover:text-primary-content hover:scale-110"
                >
                  {social.icon}
                </Link>
              ))}
            </div>

            {/* Contact buttons */}
            <div className="flex flex-row flex-nowrap gap-2 md:gap-3">
              <Link
                href={`tel:${CONTACT.phone}`}
                className="btn-gradient-solid-border flex items-center justify-start gap-1.5 md:gap-2 px-2 py-2 md:px-2.5 md:py-2.5 flex-1 max-w-32 md:max-w-40 h-10 md:h-12 text-primary-content body-sm transition-all duration-300 whitespace-nowrap"
              >
                <PhoneIcon className="w-3.5 h-3.5 md:w-4 md:h-4 relative z-1 shrink-0" />
                <span className="relative z-1 truncate">{CONTACT.phone}</span>
              </Link>

              {CONTACT.phone2 && (
                <Link
                  href={`tel:${CONTACT.phone2}`}
                  className="btn-gradient-solid-border flex items-center justify-start gap-1.5 md:gap-2 px-2 py-2 md:px-2.5 md:py-2.5 flex-1 max-w-32 md:max-w-40 h-10 md:h-12 text-primary-content body-sm transition-all duration-300 whitespace-nowrap"
                >
                  <PhoneIcon className="w-3.5 h-3.5 md:w-4 md:h-4 relative z-1 shrink-0" />
                  <span className="relative z-1 truncate">{CONTACT.phone2}</span>
                </Link>
              )}

              <Link
                href={`mailto:${CONTACT.email}`}
                className="btn-gradient-solid-border flex items-center justify-start gap-1.5 md:gap-2 px-2 py-2 md:px-2.5 md:py-2.5 flex-1 max-w-56 md:max-w-75 h-10 md:h-12 text-primary-content body-sm transition-all duration-300 whitespace-nowrap"
              >
                <EmailIcon className="w-3.5 h-3.5 md:w-4 md:h-4 relative z-1 shrink-0" />
                <span className="relative z-1 truncate">{CONTACT.email}</span>
              </Link>
            </div>
          </div>

          {/* Right columns - Links */}
          <div className="flex gap-12 lg:gap-16 xl:gap-24">
            {/* Site Map */}
            <div className="flex flex-col gap-4 min-w-35">
              <h3 className="h3 text-primary-content tracking-wider mb-1">{t('siteMap')}</h3>
              <nav className="flex flex-col gap-3">
                {siteMapLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className="body-sm text-primary-content/60 transition-colors duration-200 hover:text-primary-content text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-4 min-w-35">
              <h3 className="h3 text-primary-content tracking-wider mb-1">{t('legal')}</h3>
              <nav className="flex flex-col gap-3">
                {legalLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className="body-sm text-primary-content/60 transition-colors duration-200 hover:text-primary-content text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
