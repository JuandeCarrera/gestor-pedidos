import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OrderSuccessPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const orderId = searchParams.orderId as string

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">¡Pago Realizado con Éxito!</h1>
                <p className="text-gray-600 mb-6">
                    Gracias por tu compra. Tu pedido ha sido confirmado y lo estamos preparando.
                </p>

                {orderId && (
                    <div className="bg-gray-100 p-3 rounded mb-6 text-sm text-gray-500">
                        ID de Pedido: <span className="font-mono font-medium">{orderId}</span>
                    </div>
                )}

                <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                        Te hemos enviado un mensaje de confirmación.
                    </p>
                    {/* Link to go back to shop or homepage if exists. For now, maybe just a placeholder or close tab hint */}
                </div>
            </div>
        </div>
    )
}
