import Footer from "@/app/components/Footer"
import Hero from "@/app/components/Hero"
import HowItWorks from "@/app/components/HowItWorks"
import SampleOutput from "@/app/components/SampleOutput"
import SocialProof from "@/app/components/SocialProof"
import WaitlistForm from "@/app/components/WaitlistForm"

export default function Page() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <SampleOutput />
      <SocialProof />
      <WaitlistForm />
      <Footer />
    </main>
  )
}
