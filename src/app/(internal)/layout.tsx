import Shell from "@/components/Shell";

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}
