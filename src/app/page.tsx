import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-zinc-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Gestor de Pedidos</span>
          </div>
          <nav>
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Iniciar Sesión</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="container relative z-10 mx-auto px-4 sm:px-6 text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl lg:text-7xl">
              Optimiza tus <span className="text-primary decoration-primary/30 underline-offset-8 underline">cobros por pedido</span> por WhatsApp
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-zinc-600 dark:text-zinc-400">
              Reduce las faltas de recogida y asegura tus ventas. Genera enlaces de pago de Stripe en segundos y gestiona tus pedidos desde un solo panel.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base font-semibold">
                  Acceder al Panel <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-24 dark:bg-zinc-900/50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle>Pagos Instantáneos</CardTitle>
                  <CardDescription>Genera enlaces de Stripe al instante y envíalos directamente a tus clientes por WhatsApp.</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-none shadow-none bg-transparent">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <CardTitle>Estado en Tiempo Real</CardTitle>
                  <CardDescription>Visualiza qué pedidos han sido pagados y cuáles están pendientes de cobro o recogida.</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-none shadow-none bg-transparent">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle>Seguridad Total</CardTitle>
                  <CardDescription>Aprovecha la infraestructura de Stripe para cobros seguros y cumple con las normativas financieras.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 text-center text-zinc-500 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} Gestor de Pedidos. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
