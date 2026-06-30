import InfoLanding from '@/components/landing/InfoLanding'
import HeroSection from '@/components/landing/HeroSection'
import { infos } from '@/config/landing'
import Features from '@/components/landing/Features'
import BentoGrid from '@/components/landing/BentoGrid'
import Testimonials from '@/components/landing/Testimonials'
import SiteFooter from '@/components/landing/SiteFooter'
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