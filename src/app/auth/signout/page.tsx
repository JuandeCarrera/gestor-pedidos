'use client'

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, ArrowLeft } from "lucide-react"

export default function SignOutPage() {
    const router = useRouter()

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-[350px] shadow-lg">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-100 rounded-full">
                            <LogOut className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                    <CardTitle>¿Cerrar sesión?</CardTitle>
                    <CardDescription>
                        ¿Estás seguro de que quieres salir de la aplicación?
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col space-y-2">
                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => signOut({ callbackUrl: '/login' })}
                    >
                        Cerrar Sesión
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
