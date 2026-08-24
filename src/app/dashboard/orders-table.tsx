'use client'

import * as XLSX from 'xlsx';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem, CommandList, CommandEmpty, CommandInput, CommandSeparator } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Copy, CheckCircle, Clock, XCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, Download, Calendar, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { OrderDetailsDialog } from "./order-details-dialog"

type Order = {
    id: string
    readableId: string
    customerPhone: string
    customerName: string | null
    productDetails: string
    amount: number
    status: string
    stripePaymentLink: string | null
    createdAt: string
    paidAt?: string | null
    collectedAt?: string | null
    items?: { id: string; name: string; price: number }[]
}

type SortConfig = {
    key: keyof Order | 'date'
    direction: 'asc' | 'desc'
}

export function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string[]>([])
    const [dateFilter, setDateFilter] = useState("ALL") // ALL, TODAY, WEEK, MONTH
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' })

    const exportToExcel = () => {
        const data = filteredOrders.map(order => ({
            "ID": order.readableId,
            "Cliente": order.customerName || '',
            "Teléfono": order.customerPhone,
            "Producto": order.items?.map(i => i.name).join(' + ') || order.productDetails,
            "Precio": Number(order.amount.toFixed(2)),
            "Estado": order.status,
            "Fecha Creación": new Date(order.createdAt).toLocaleString(),
            "Fecha Pago": order.paidAt ? new Date(order.paidAt).toLocaleString() : '',
            "Fecha Recogida": order.collectedAt ? new Date(order.collectedAt).toLocaleString() : ''
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
        XLSX.writeFile(wb, `pedidos_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert("Enlace copiado!")
    }

    const updateOrderStatus = async (id: string, newStatus: string, confirmMsg: string) => {
        if (!confirm(confirmMsg)) return;

        setLoadingId(id)
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!res.ok) throw new Error('Failed')

            router.refresh()
        } catch (error) {
            alert("Error actualizando pedido")
        } finally {
            setLoadingId(null)
        }
    }

    const handleSort = (key: keyof Order | 'date') => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const filteredOrders = useMemo(() => {
        return initialOrders.filter(order => {
            const matchesSearch =
                order.readableId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.productDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerPhone.includes(searchTerm)

            const matchesStatus = statusFilter.length === 0 || statusFilter.includes(order.status)

            let matchesDate = true
            if (dateFilter !== "ALL") {
                const orderDate = new Date(order.createdAt)
                const now = new Date()
                orderDate.setHours(0, 0, 0, 0)
                now.setHours(0, 0, 0, 0)

                if (dateFilter === "TODAY") {
                    matchesDate = orderDate.getTime() === now.getTime()
                } else if (dateFilter === "WEEK") {
                    const weekAgo = new Date(now)
                    weekAgo.setDate(now.getDate() - 7)
                    matchesDate = orderDate >= weekAgo
                } else if (dateFilter === "MONTH") {
                    const monthAgo = new Date(now)
                    monthAgo.setMonth(now.getMonth() - 1)
                    matchesDate = orderDate >= monthAgo
                }
            }

            return matchesSearch && matchesStatus && matchesDate
        })
    }, [initialOrders, searchTerm, statusFilter, dateFilter])

    const sortedOrders = useMemo(() => {
        const items = [...filteredOrders]
        items.sort((a, b) => {
            if (sortConfig.key === 'date') {
                const aTime = new Date(a.createdAt).getTime()
                const bTime = new Date(b.createdAt).getTime()
                return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime
            }

            const aValue = (a[sortConfig.key as keyof Order] ?? '') as string | number
            const bValue = (b[sortConfig.key as keyof Order] ?? '') as string | number

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1
            }
            return 0
        })
        return items
    }, [filteredOrders, sortConfig])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING_PAYMENT':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-none">Pendiente</Badge>
            case 'PAID':
                return <Badge variant="outline" className="bg-green-100 text-green-800 border-none">Pagado</Badge>
            case 'COLLECTED':
                return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-none">Recogido</Badge>
            case 'CANCELLED':
                return <Badge variant="outline" className="bg-red-100 text-red-800 border-none">Cancelado</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const SortIcon = ({ column }: { column: keyof Order | 'date' }) => {
        if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar cliente, teléfono o ID..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[180px]">
                        <Calendar className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Periodo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todo el Historial</SelectItem>
                        <SelectItem value="TODAY">Hoy</SelectItem>
                        <SelectItem value="WEEK">Últimos 7 días</SelectItem>
                        <SelectItem value="MONTH">Último Mes</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={exportToExcel} title="Exportar a Excel">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Excel
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px] cursor-pointer" onClick={() => handleSort('readableId')}>
                                <div className="flex items-center">ID <SortIcon column="readableId" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('customerName')}>
                                <div className="flex items-center">Cliente <SortIcon column="customerName" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('productDetails')}>
                                <div className="flex items-center">Producto <SortIcon column="productDetails" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                                <div className="flex items-center">Precio <SortIcon column="amount" /></div>
                            </TableHead>
                            <TableHead>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-8 flex items-center gap-2 -ml-2 hover:bg-transparent hover:text-primary",
                                                statusFilter.length > 0 ? "text-primary font-bold" : "text-muted-foreground"
                                            )}
                                        >
                                            Estado
                                            <Filter className="h-4 w-4" />
                                            {statusFilter.length > 0 && (
                                                <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal h-5">
                                                    {statusFilter.length}
                                                </Badge>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0" align="start">
                                        <Command>
                                            <CommandList>
                                                <CommandEmpty>No results found.</CommandEmpty>
                                                <CommandGroup>
                                                    {[
                                                        { value: "PENDING_PAYMENT", label: "Pendiente" },
                                                        { value: "PAID", label: "Pagado" },
                                                        { value: "COLLECTED", label: "Recogido" },
                                                        { value: "CANCELLED", label: "Cancelado" },
                                                    ].map((option) => {
                                                        const isSelected = statusFilter.includes(option.value)
                                                        return (
                                                            <CommandItem
                                                                key={option.value}
                                                                onSelect={() => {
                                                                    if (isSelected) {
                                                                        setStatusFilter(statusFilter.filter((s) => s !== option.value))
                                                                    } else {
                                                                        setStatusFilter([...statusFilter, option.value])
                                                                    }
                                                                }}
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                        isSelected
                                                                            ? "bg-primary text-primary-foreground"
                                                                            : "opacity-50 [&_svg]:invisible"
                                                                    )}
                                                                >
                                                                    <CheckCircle className={cn("h-4 w-4")} />
                                                                </div>
                                                                <span>{option.label}</span>
                                                            </CommandItem>
                                                        )
                                                    })}
                                                </CommandGroup>
                                                {statusFilter.length > 0 && (
                                                    <>
                                                        <CommandSeparator />
                                                        <CommandGroup>
                                                            <CommandItem
                                                                onSelect={() => setStatusFilter([])}
                                                                className="justify-center text-center"
                                                            >
                                                                Limpiar filtros
                                                            </CommandItem>
                                                        </CommandGroup>
                                                    </>
                                                )}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                                <div className="flex items-center">Fecha <SortIcon column="date" /></div>
                            </TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.readableId}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{order.customerName || 'Sin Nombre'}</span>
                                        <span className="text-xs text-gray-500">{order.customerPhone}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[200px]" title={order.productDetails}>
                                    {order.items && order.items.length > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            {order.items.map((item, i) => (
                                                <span key={i} className="text-sm border-b last:border-0 pb-1 last:pb-0">
                                                    {item.name} <span className="text-gray-500">({item.price}€)</span>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        order.productDetails
                                    )}
                                </TableCell>
                                <TableCell>{order.amount.toFixed(2)} €</TableCell>
                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2 items-center">
                                        {(order.status === 'COLLECTED' || order.status === 'CANCELLED') && (
                                            <OrderDetailsDialog order={order} />
                                        )}
                                        {order.stripePaymentLink && order.status === 'PENDING_PAYMENT' && (
                                            <>
                                                <OrderDetailsDialog order={order} />
                                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(order.stripePaymentLink!)}>
                                                    <Copy className="h-4 w-4 mr-1" /> Link
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => updateOrderStatus(order.id, 'PAID', "¿Confirmar pago manual?")}
                                                    disabled={loadingId === order.id}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Pagar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => updateOrderStatus(order.id, 'CANCELLED', "¿Seguro que quieres cancelar este pedido?")}
                                                    disabled={loadingId === order.id}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    {loadingId === order.id ? '...' : 'Cancelar'}
                                                </Button>
                                            </>
                                        )}
                                        {order.status === 'PAID' && (
                                            <>
                                                <OrderDetailsDialog order={order} />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateOrderStatus(order.id, 'COLLECTED', "¿Confirmar que el pedido ha sido recogido?")}
                                                    disabled={loadingId === order.id}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    {loadingId === order.id ? '...' : 'Recogido'}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {sortedOrders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No se encontraron pedidos
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
