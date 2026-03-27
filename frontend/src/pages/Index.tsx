import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { TrustStrip } from '@/components/home/TrustStrip';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FeaturedCollection } from '@/components/home/FeaturedCollection';
import { BestsellersSection } from '@/components/home/BestsellersSection';
import { VideoShowcase } from '@/components/home/VideoShowcase';
import { WhyClayzio } from '@/components/home/WhyClayzio';
import { BrandStory } from '@/components/home/BrandStory';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { InstagramSection } from '@/components/home/InstagramSection';
import ImageSection from '@/components/home/ImageSection'

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <TrustStrip />
      <CategoriesSection />
      <ImageSection />
      <FeaturedCollection />
      <BestsellersSection />
      <VideoShowcase />
      <WhyClayzio />
      <BrandStory />
      <TestimonialsSection />
      <InstagramSection />
    </Layout>
  );
};

export default Index;
