'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, CheckCircle, Copy, X, Trash2 } from "lucide-react"

export function CreateOrderDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [customerPhone, setCustomerPhone] = useState('')
    const [customerName, setCustomerName] = useState('')

    // Item state
    const [items, setItems] = useState<{ name: string, price: string }[]>([])
    const [newItemName, setNewItemName] = useState('')
    const [newItemPrice, setNewItemPrice] = useState('')

    const [errors, setErrors] = useState({
        customerPhone: '',
        customerName: '',
        items: '',
    })

    // Store the created order to show success state
    const [createdOrder, setCreatedOrder] = useState<any>(null)

    const addItem = () => {
        if (!newItemName.trim() || !newItemPrice || Number(newItemPrice) <= 0) {
            return
        }
        setItems([...items, { name: newItemName, price: newItemPrice }])
        setNewItemName('')
        setNewItemPrice('')
        setErrors({ ...errors, items: '' })
    }

    const removeItem = (index: number) => {
        const newItems = [...items]
        newItems.splice(index, 1)
        setItems(newItems)
    }

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + Number(item.price), 0).toFixed(2)
    }

    const validateForm = () => {
        let isValid = true
        const newErrors = { customerPhone: '', customerName: '', items: '' }

        // Validate Name: Only letters and spaces
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
        if (!customerName.trim()) {
            newErrors.customerName = 'El nombre es obligatorio.'
            isValid = false
        } else if (!nameRegex.test(customerName)) {
            newErrors.customerName = 'El nombre solo puede contener letras.'
            isValid = false
        }

        // Validate Phone: Digits, spaces, +, -, ()
        const phoneRegex = /^[0-9+\-\s()]{9,}$/
        if (!customerPhone.trim()) {
            newErrors.customerPhone = 'El teléfono es obligatorio.'
            isValid = false
        } else if (!phoneRegex.test(customerPhone)) {
            newErrors.customerPhone = 'El teléfono no es válido (mínimo 9 dígitos).'
            isValid = false
        }

        // Validate Items
        if (items.length === 0) {
            newErrors.items = 'Debes añadir al menos un producto.'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerName,
                    customerPhone,
                    items
                }),
            })

            if (!res.ok) throw new Error('Failed to create order')

            const order = await res.json()

            // Set success state instead of closing
            setCreatedOrder(order)

            // Clear form data for next time
            setCustomerName('')
            setCustomerPhone('')
            setItems([])
            setErrors({ customerPhone: '', customerName: '', items: '' })

            router.refresh()

        } catch (error: any) {
            console.error(error)
            alert(`Error creando pedido: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (createdOrder?.stripePaymentLink) {
            navigator.clipboard.writeText(createdOrder.stripePaymentLink)
            alert("Enlace copiado al portapapeles")
        }
    }

    const handleClose = () => {
        setOpen(false)
        // Delay resetting the success state so the transition is smooth or simply reset it when opening?
        // Better to reset it now so next open is clean.
        setTimeout(() => setCreatedOrder(null), 300)
    }

    const onOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            // Reset success state when dialog is closed
            setTimeout(() => setCreatedOrder(null), 300)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Pedido
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                {createdOrder ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in fade-in zoom-in duration-300">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <DialogHeader>
                            <DialogTitle className="text-center text-xl">¡Pedido Guardado!</DialogTitle>
                            <DialogDescription className="text-center">
                                El pedido se ha creado correctamente. Comparte el enlace de pago con el cliente.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex w-full items-center space-x-2 mt-4">
                            <Input
                                readOnly
                                value={createdOrder.stripePaymentLink || ''}
                                className="bg-gray-50"
                            />
                            <Button size="icon" variant="outline" onClick={copyToClipboard}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>

                        <DialogFooter className="w-full sm:justify-center mt-4">
                            <Button onClick={handleClose} className="w-full sm:w-auto min-w-[120px]">
                                Cerrar
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Pedido</DialogTitle>
                            <DialogDescription>
                                Añade los productos y los datos del cliente.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Customer Data */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">Teléfono</Label>
                                <div className="col-span-3">
                                    <Input
                                        id="phone"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="600123456"
                                        required
                                    />
                                    {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nombre</Label>
                                <div className="col-span-3">
                                    <Input
                                        id="name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Juan Pérez"
                                        required
                                    />
                                    {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t my-2"></div>

                            {/* Add Item Section */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Añadir Productos</h4>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Producto"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        className="flex-grow"
                                    />
                                    <Input
                                        placeholder="Precio (€)"
                                        type="number"
                                        step="0.01"
                                        value={newItemPrice}
                                        onChange={(e) => setNewItemPrice(e.target.value)}
                                        className="w-24"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                addItem()
                                            }
                                        }}
                                    />
                                    <Button type="button" size="icon" onClick={addItem} disabled={!newItemName || !newItemPrice}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {errors.items && <p className="text-red-500 text-xs">{errors.items}</p>}
                            </div>

                            {/* Items List */}
                            <div className="space-y-2 max-h-[150px] overflow-y-auto border rounded-md p-2 bg-gray-50">
                                {items.length === 0 ? (
                                    <p className="text-sm text-center text-gray-500 py-2">No hay productos añadidos</p>
                                ) : (
                                    items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                                            <span className="truncate flex-grow pr-2">{item.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{item.price} €</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center pt-2 border-t">
                                <span className="font-bold">Total:</span>
                                <span className="text-xl font-bold">{calculateTotal()} €</span>
                            </div>

                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Generando...' : 'Crear Pedido'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
