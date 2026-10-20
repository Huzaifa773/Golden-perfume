import { redirect } from "next/navigation";

export default function ProductsRedirect({ searchParams }: { searchParams: { search?: string } }) {
  if (searchParams?.search) {
    redirect(`/search?q=${encodeURIComponent(searchParams.search)}`);
  }
  redirect("/shop");
}
