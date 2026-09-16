import { redirect } from "next/navigation";
import { getConteudo, imagemUrl } from "@/lib/site/content";
export const dynamic = "force-dynamic";
export default async function Icon() {
  const marca = await getConteudo("marca");
  redirect(imagemUrl(marca.faviconPath, "/icon.png"));
}
