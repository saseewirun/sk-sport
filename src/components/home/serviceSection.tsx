'use client'

import React from 'react'
import { HomeLargeServiceCard, HomeSupportServiceCard } from './homeServiceCards'
import { BasketballIcon, HeartbeatIcon, InfoIcon } from '@phosphor-icons/react/dist/ssr'

const INTEGRATED_SPORTS_INSTALLATION_SLUG = 'integrated-sports-installation'

export type IntegratedSportsInstallationHomeTeaser = {
  title: string
  description: string
  image: string
  href: string
  imageAlt: string
}

const legacyFirstLargeServiceCard: IntegratedSportsInstallationHomeTeaser = {
  title: `Gymnastic Equipment\nInstallation`,
  description: `From planning and positioning to anchoring and final safety checks, we deliver a complete installation service built for long-term performance.`,
  image: '/gymnastic-equipment.png',
  href: `/service/${INTEGRATED_SPORTS_INSTALLATION_SLUG}`,
  imageAlt: 'Gymnastic equipment in a modern facility',
}

const legacySecondLargeServiceCard: IntegratedSportsInstallationHomeTeaser = {
  title: `Outdoor Exercise\nEquipment`,
  description: `Expert installation for every facility—aligned, secured, and tested to meet standards for safe daily training and competition readiness.`,
  image: '/outdoor-exercise-equipment.png',
  href: '/service/outdoor-exercise-equipment',
  imageAlt: 'Outdoor exercise equipment at sunset',
}

export type HomeSupportServiceTeaser = {
  title: string
  image: string
  href: string
  imageAlt: string
}

const legacyFirstSupportCard: HomeSupportServiceTeaser = {
  title: 'Consulting & Design',
  image: '/consulting-support-services.png',
  href: '/service/consulting-design',
  imageAlt: 'Consulting and Design Services',
}

const legacySecondSupportCard: HomeSupportServiceTeaser = {
  title: 'Health Care Service',
  image: '/healthcare-support-services.png',
  href: '/service/health-care-service',
  imageAlt: 'Health Care Services',
}

const legacyThirdSupportCard: HomeSupportServiceTeaser = {
  title: 'Maintenance & Support',
  image: '/maintenance-support-services.png',
  href: '/service/maintenance-support',
  imageAlt: 'Maintenance and Support Services',
}

type ServicesProps = {
  integratedSportsInstallationTeaser?: IntegratedSportsInstallationHomeTeaser | null
  equipmentForTopGymnastsTeaser?: IntegratedSportsInstallationHomeTeaser | null
  sportsVisionTrainingTeaser?: HomeSupportServiceTeaser | null
  healthManagementSystemTeaser?: HomeSupportServiceTeaser | null
  unitedDiscoveryTeaser?: HomeSupportServiceTeaser | null
  sectionTitleFontSizePx: number
  taglineFontSizePx: number
  cardTitleFontSizePx: number
  cardBodyFontSizePx: number
}

export const Services = ({
  integratedSportsInstallationTeaser,
  equipmentForTopGymnastsTeaser,
  sportsVisionTrainingTeaser,
  healthManagementSystemTeaser,
  unitedDiscoveryTeaser,
  sectionTitleFontSizePx,
  taglineFontSizePx,
  cardTitleFontSizePx,
  cardBodyFontSizePx,
}: ServicesProps) => {
  const firstLargeCard = integratedSportsInstallationTeaser ?? legacyFirstLargeServiceCard
  const secondLargeCard = equipmentForTopGymnastsTeaser ?? legacySecondLargeServiceCard
  const firstSupportCard = sportsVisionTrainingTeaser ?? legacyFirstSupportCard
  const secondSupportCard = healthManagementSystemTeaser ?? legacySecondSupportCard
  const thirdSupportCard = unitedDiscoveryTeaser ?? legacyThirdSupportCard

  return (
    <section className="w-full">
      <div className="relative text-primary space-y-4 text-center py-12 px-4">
        <h2 className="font-body font-semibold" style={{ fontSize: `${sectionTitleFontSizePx}px` }}>
          Our Services
        </h2>
        <p className="font-body" style={{ fontSize: `${taglineFontSizePx}px` }}>
          Professional solution for sports facility development
        </p>
      </div>

      {/* Services Content */}
      <div className="w-full">
        <div className="mb-2 grid w-full grid-cols-1 gap-2 lg:grid-cols-2">
          {/* Left Card */}
          <HomeLargeServiceCard
            title={firstLargeCard.title}
            description={firstLargeCard.description}
            image={firstLargeCard.image}
            href={firstLargeCard.href}
            buttonText="Learn more"
            imageAlt={firstLargeCard.imageAlt}
            alignButton="bottom"
            titleFontSizePx={cardTitleFontSizePx}
            bodyFontSizePx={cardBodyFontSizePx}
          />

          {/* Right Card */}
          <HomeLargeServiceCard
            title={secondLargeCard.title}
            description={secondLargeCard.description}
            image={secondLargeCard.image}
            href={secondLargeCard.href}
            buttonText="Learn more"
            imageAlt={secondLargeCard.imageAlt}
            alignButton="bottom"
            titleFontSizePx={cardTitleFontSizePx}
            bodyFontSizePx={cardBodyFontSizePx}
          />
        </div>

        {/* Support cards — part of the same unified services section */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 mt-2">
          <HomeSupportServiceCard
            title={firstSupportCard.title}
            image={firstSupportCard.image}
            icon={<BasketballIcon size={48} weight="light" />}
            href={firstSupportCard.href}
            imageAlt={firstSupportCard.imageAlt}
            titleFontSizePx={cardTitleFontSizePx}
          />
          <HomeSupportServiceCard
            title={secondSupportCard.title}
            image={secondSupportCard.image}
            icon={<HeartbeatIcon size={48} weight="light" color="#FF3591" />}
            href={secondSupportCard.href}
            imageAlt={secondSupportCard.imageAlt}
            titleFontSizePx={cardTitleFontSizePx}
          />
          <HomeSupportServiceCard
            title={thirdSupportCard.title}
            image={thirdSupportCard.image}
            icon={<InfoIcon size={48} weight="light" />}
            href={thirdSupportCard.href}
            imageAlt={thirdSupportCard.imageAlt}
            titleFontSizePx={cardTitleFontSizePx}
          />
        </div>
      </div>
    </section>
  )
}
