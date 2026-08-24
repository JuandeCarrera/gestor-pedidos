import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { CreateOrderDialog } from "./create-order-dialog"
import { OrdersTable } from "./orders-table"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const orders = await prisma.order.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    })

    // Serialize dates to strings for Client Component
    const serializedOrders = orders.map(order => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        paidAt: order.paidAt?.toISOString() || null,
        collectedAt: order.collectedAt?.toISOString() || null,
    }))

    return (
        <div className="container mx-auto py-10 px-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gestor de Pedidos</h1>
                <div className="flex gap-4">
                    <CreateOrderDialog />
                    <a href="/auth/signout">
                        <Button variant="outline" size="icon">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </a>
                </div>
            </div>

            <div className="rounded-md border p-4">
                <OrdersTable initialOrders={serializedOrders} />
            </div>
        </div>
    )
}
