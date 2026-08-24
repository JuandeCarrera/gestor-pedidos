import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, Clock, CheckCircle, PackageCheck } from "lucide-react"

type OrderItem = {
    name: string
    price: number
}

type OrderDetailsProps = {
    order: {
        id: string
        readableId: string
        items?: OrderItem[]
        productDetails: string
        createdAt: string
        paidAt?: string | null
        collectedAt?: string | null
        status: string
    }
}

export function OrderDetailsDialog({ order }: OrderDetailsProps) {
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return null
        return new Date(dateString).toLocaleString()
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Ver Detalles">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Detalles del Pedido {order.readableId}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Items List */}
                    <div>
                        <h4 className="font-semibold mb-2">Productos:</h4>
                        <ul className="space-y-1">
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                    <li key={index} className="flex justify-between text-sm">
                                        <span>{item.name}</span>
                                        <span className="text-gray-500">{item.price} €</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm">{order.productDetails}</li>
                            )}
                        </ul>
                    </div>

                    <div className="border-t my-2"></div>

                    {/* Timeline */}
                    <div>
                        <h4 className="font-semibold mb-2">Historial:</h4>
                        <div className="space-y-4 relative pl-4 border-l-2 border-gray-200 ml-2">
                            {/* Created */}
                            <div className="relative">
                                <span className="absolute -left-[21px] bg-blue-500 rounded-full w-3 h-3 mt-1.5 border-2 border-white"></span>
                                <div className="ml-2">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Creado
                                    </p>
                                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                                </div>
                            </div>

                            {/* Paid */}
                            {order.paidAt && (
                                <div className="relative">
                                    <span className="absolute -left-[21px] bg-green-500 rounded-full w-3 h-3 mt-1.5 border-2 border-white"></span>
                                    <div className="ml-2">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <CheckCircle className="w-3 h-3" /> Pagado
                                        </p>
                                        <p className="text-xs text-gray-500">{formatDate(order.paidAt)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Collected */}
                            {order.collectedAt && (
                                <div className="relative">
                                    <span className="absolute -left-[21px] bg-purple-500 rounded-full w-3 h-3 mt-1.5 border-2 border-white"></span>
                                    <div className="ml-2">
                                        <p className="text-sm font-medium flex items-center gap-2">
                                            <PackageCheck className="w-3 h-3" /> Recogido
                                        </p>
                                        <p className="text-xs text-gray-500">{formatDate(order.collectedAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
