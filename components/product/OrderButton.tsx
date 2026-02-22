'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'
import { CallbackModal } from '@/components/layout'
import { cn } from '@/lib/utils'

interface OrderButtonProps {
  machineTitle: string
  className?: string
}

export function OrderButton({ machineTitle, className }: OrderButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "w-full py-4 px-6 bg-accent hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] text-dark font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-accent/30",
          className
        )}
      >
        <Phone size={24} />
        Рассчитать смету
      </button>

      <CallbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        machineName={machineTitle}
        source={`Карточка товара - ${machineTitle}`}
      />
    </>
  )
}
