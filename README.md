# Gestor de Pedidos

Aplicación web para gestionar pedidos en comercios locales que reciben encargos por teléfono o WhatsApp. Digitaliza el proceso de toma de pedido, cobro y seguimiento sin necesidad de integración con sistemas de inventario externos.

## ¿Qué hace?

1. El trabajador crea un pedido desde el panel con el nombre del cliente, teléfono y productos
2. La app genera automáticamente un enlace de pago de **Stripe Checkout**
3. El trabajador envía el enlace al cliente por WhatsApp o SMS
4. Cuando el cliente paga, Stripe notifica a la app vía **webhook** y el pedido se marca como pagado
5. El pedido queda en estado "pendiente de recogida" hasta que el trabajador lo confirma

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| UI | React 19 + shadcn/ui + Tailwind CSS |
| Base de datos | SQLite + Prisma ORM |
| Autenticación | NextAuth v4 + bcryptjs |
| Pagos | Stripe Checkout + Webhooks |
| Exportación | xlsx (Excel) |

## Funcionalidades

- Panel de gestión con tabla de pedidos filtrable por estado y fecha
- Creación de pedidos con generación automática de link de pago Stripe
- Confirmación de pago automática vía webhook
- Vista de detalle de pedido con historial de estado
- Ticket imprimible por pedido
- Exportación del historial a Excel
- Autenticación con email y contraseña

## Instalación local

```bash
# 1. Clona el repositorio
git clone https://github.com/JuandeCarrera/gestor-pedidos.git
cd gestor-pedidos

# 2. Instala dependencias
npm install

# 3. Configura las variables de entorno
cp .env.example .env
# Edita .env con tus claves de Stripe y un NEXTAUTH_SECRET

# 4. Inicializa la base de datos
npx prisma migrate dev
npx prisma db seed

# 5. Arranca el servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000`.

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Ruta al archivo SQLite (`file:./dev.db`) |
| `NEXTAUTH_SECRET` | Cadena aleatoria para firmar sesiones |
| `NEXTAUTH_URL` | URL base de la app |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Secret del webhook de Stripe (whsec_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe (pk_test_...) |

## Webhook de Stripe en local

Para probar el webhook localmente necesitas Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks
```

## Autor

Juan de Dios Carrera Zazo — [github.com/JuandeCarrera](https://github.com/JuandeCarrera)
