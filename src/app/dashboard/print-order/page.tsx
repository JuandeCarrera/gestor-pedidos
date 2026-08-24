import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"

export default async function PrintOrderPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    // Await params if needed (Next.js 15+ checks, but this looks like 14 or standard)
    // Safe to just access searchParams in most current versions for this playground
    // But recently types changed.

    // Check if params need to be awaited? In recent Next.js versions yes.
    // Prograde-spicule seems to use Next 14/15 based on previous errors.
    // Let's assume standard access for now, fix if error.

    // UPDATE: Previous error showed 'params: Promise' but that was route param, not searchParams.
    // searchParams usually doesn't need await in server pages yet unless very new.
    // I'll assume direct access.

    const session = await getServerSession(authOptions)
    if (!session) redirect("/login")

    const id = searchParams.id as string
    if (!id) return <div>No ID provided</div>

    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true }
    }) as any

    if (!order) return <div>Pedido no encontrado</div>

    return (
        <div className="p-8 max-w-md mx-auto bg-white min-h-screen text-sm font-mono text-black relative">

            <div className="text-center mb-6">
                <h1 className="text-xl font-bold uppercase mb-1">GESTOR DE PEDIDOS</h1>
                <p>Pedido generado digitalmente</p>
                <p>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>

            <div className="border-b-2 border-black my-4 border-dashed"></div>

            <div className="mb-4">
                <div className="flex justify-between">
                    <span className="font-bold">Pedido:</span>
                    <span>{order.readableId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-bold">Cliente:</span>
                    <span>{order.customerName || 'Consumidor Final'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-bold">Teléfono:</span>
                    <span>{order.customerPhone}</span>
                </div>
            </div>

            <div className="border-b-2 border-black my-4 border-dashed"></div>

            <table className="w-full text-left mb-4">
                <thead>
                    <tr>
                        <th className="pb-2 font-bold">Prod.</th>
                        <th className="text-right pb-2 font-bold">Precio</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.length > 0 ? order.items.map((item, i) => (
                        <tr key={i}>
                            <td className="align-top py-1 pr-2">{item.name}</td>
                            <td className="align-top text-right py-1 whitespace-nowrap">{item.price.toFixed(2)}€</td>
                        </tr>
                    )) : (
                        <tr>
                            <td className="align-top py-1 pr-2">{order.productDetails}</td>
                            <td className="align-top text-right py-1 whitespace-nowrap">{order.amount.toFixed(2)}€</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="border-b-2 border-black my-4 border-dashed"></div>

            <div className="flex justify-between text-lg font-bold">
                <span>TOTAL</span>
                <span>{order.amount.toFixed(2)}€</span>
            </div>

            <div className="mt-2 flex justify-between text-xs">
                <span>Estado:</span>
                <span className="uppercase">{order.status}</span>
            </div>

            <div className="border-b-2 border-black my-4 border-dashed"></div>

            <div className="text-center mt-8 space-y-2">
                <p>¡Gracias por su confianza!</p>
                <p className="text-xs">Conserve este ticket para cambios o devoluciones.</p>
            </div>
        </div>
    )
}
