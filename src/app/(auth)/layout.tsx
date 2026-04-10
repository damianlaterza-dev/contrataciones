/* Acá va el Sidebar */
import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.name || !session.user.email || !session.user.image) {
    return null;
  }

  const loggedUser = {
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image,
  };

  return (
    <SidebarProvider open={false} defaultOpen={false}>
      <AppSidebar user={loggedUser} />
      <SidebarInset>
        <div className="auth-layout">
          <Header />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
