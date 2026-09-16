import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getConteudo, imagemUrl } from "@/lib/site/content";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const marca = await getConteudo("marca");
  const logoGoldUrl = imagemUrl(marca.logoGoldPath, "/brand/logo-gold.png");
  const logoNavyUrl = imagemUrl(marca.logoNavyPath, "/brand/logo-navy.png");
  return (
    <div className="flex min-h-full flex-col">
      <Header marca={marca} logoGoldUrl={logoGoldUrl} logoNavyUrl={logoNavyUrl} />
      <main className="flex-1">{children}</main>
      <Footer marca={marca} logoGoldUrl={logoGoldUrl} />
    </div>
  );
}
