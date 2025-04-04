import InfoLanding from '@/components/landing/info-landing'
import HeroSection from '@/components/landing/hero-section'
import { infos } from '@/config/landing'
import Features from '@/components/landing/features'
import BentoGrid from '@/components/landing/bentogrid'
import Testimonials from '@/components/landing/testimonials'
import SiteFooter from '@/components/landing/site-footer'
import CTA from '@/components/landing/CTA'
// import QuickQuizStart from '@/components/landing/QuickQuizStart'

const StudentsLanding = () => {
  return (
    <div>
        <HeroSection />
        {/* <QuickQuizStart /> */}
        <InfoLanding data={infos[0]} reverse={true}/>
        <Features />
        <BentoGrid />
        <Testimonials />
        <CTA />
        <SiteFooter />
    </div>
  )
}

export default StudentsLanding