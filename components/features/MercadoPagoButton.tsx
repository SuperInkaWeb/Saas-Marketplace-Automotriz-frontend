"use client";

import { useEffect, useState } from "react";
import { getToken } from "../../lib/session";

interface MercadoPagoButtonProps {
    orderId: number;
    title: string;
    amount: number;
}

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export default function MercadoPagoButton({ orderId, title, amount }: MercadoPagoButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Llamamos a tu Backend para crear la preferencia
            const response = await fetch("http://localhost:8080/api/payments/create-preference", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    title: `Pedido #${orderId} - ${title}`,
                    quantity: 1,
                    price: amount
                })
            });

            const preferenceId = await response.text();

            // 2. Inicializamos el SDK de Mercado Pago con tu Public Key
            const mp = new window.MercadoPago("TEST-46002230-d1b8-4852-a868-8e6fdd6b9d69", {
                locale: "es-PE" // o tu país
            });

            // 3. Abrimos el checkout
            mp.checkout({
                preference: { id: preferenceId },
                autoOpen: true, // Abre el modal de pago automáticamente
            });

        } catch (error) {
            console.error("Error en el pago:", error);
            alert("No se pudo iniciar el pago. Revisa la consola.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full mt-4 py-3 bg-[#009EE3] text-white font-bold rounded-2xl hover:bg-[#0087C3] transition shadow-lg flex items-center justify-center gap-2"
        >
            {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M36 12H12C9.79086 12 8 13.7909 8 16V32C8 34.2091 9.79086 36 12 36H36C38.2091 36 40 34.2091 40 32V16C40 13.7909 38.2091 12 36 12Z" fill="white" />
                        <path d="M8 20H40" stroke="#009EE3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Pagar con Mercado Pago
                </>
            )}
        </button>
    );
}
