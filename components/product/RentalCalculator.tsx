'use client'

import { useState, useMemo } from 'react'
import { Calculator, Clock, Calendar, Truck } from 'lucide-react'

interface RentalCalculatorProps {
  shiftPrice: number
  hourlyPrice?: number | null
}

type RentalType = 'shift' | 'hour'

// Стоимость доставки за км от КАД
const DELIVERY_PRICE_PER_KM = 100

export function RentalCalculator({ shiftPrice, hourlyPrice }: RentalCalculatorProps) {
  const [rentalType, setRentalType] = useState<RentalType>('shift')
  const [quantity, setQuantity] = useState(1)
  const [deliveryKm, setDeliveryKm] = useState(0)

  // Расчёт итоговой суммы
  const totalPrice = useMemo(() => {
    const basePrice = rentalType === 'shift' ? shiftPrice : (hourlyPrice || 0)
    const rentalCost = basePrice * quantity
    const deliveryCost = deliveryKm * DELIVERY_PRICE_PER_KM * 2 // туда и обратно
    return rentalCost + deliveryCost
  }, [rentalType, quantity, deliveryKm, shiftPrice, hourlyPrice])

  // Только стоимость аренды
  const rentalCost = useMemo(() => {
    const basePrice = rentalType === 'shift' ? shiftPrice : (hourlyPrice || 0)
    return basePrice * quantity
  }, [rentalType, quantity, shiftPrice, hourlyPrice])

  // Стоимость доставки
  const deliveryCost = deliveryKm * DELIVERY_PRICE_PER_KM * 2

  // Проверка доступности почасовой аренды
  const hasHourlyRate = hourlyPrice && hourlyPrice > 0

  return (
    <div className="bg-surface border border-white/10 rounded-xl p-6">
      <h3 className="font-display text-lg font-bold uppercase mb-4 flex items-center gap-2">
        <Calculator size={20} className="text-accent" />
        Калькулятор аренды
      </h3>

      {/* Тип аренды */}
      <div className="mb-4">
        <label className="text-sm text-text-gray mb-2 block">Тип аренды</label>
        <div className="flex gap-2">
          <button
            onClick={() => setRentalType('shift')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              rentalType === 'shift'
                ? 'bg-accent text-dark'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <Calendar size={18} />
            Смена (7+1)
          </button>
          <button
            onClick={() => setRentalType('hour')}
            disabled={!hasHourlyRate}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              rentalType === 'hour'
                ? 'bg-accent text-dark'
                : 'bg-white/5 text-white hover:bg-white/10'
            } ${!hasHourlyRate ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!hasHourlyRate ? 'Почасовая аренда недоступна' : ''}
          >
            <Clock size={18} />
            Час
          </button>
        </div>
      </div>

      {/* Количество */}
      <div className="mb-4">
        <label className="text-sm text-text-gray mb-2 block">
          Количество {rentalType === 'shift' ? 'смен' : 'часов'}
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-12 md:w-10 md:h-10 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/20 transition flex items-center justify-center text-2xl md:text-xl font-bold"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-center text-xl font-bold text-white focus:outline-none focus:border-accent"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-12 h-12 md:w-10 md:h-10 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/20 transition flex items-center justify-center text-2xl md:text-xl font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Доставка */}
      <div className="mb-6">
        <label className="text-sm text-text-gray mb-2 flex items-center gap-2">
          <Truck size={16} />
          Расстояние от КАД (км)
        </label>
        <input
          type="number"
          min={0}
          value={deliveryKm}
          onChange={(e) => setDeliveryKm(Math.max(0, parseInt(e.target.value) || 0))}
          placeholder="0"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
        />
        <p className="text-xs text-text-gray mt-1">
          {DELIVERY_PRICE_PER_KM} ₽/км × 2 (туда и обратно)
        </p>
      </div>

      {/* Разбивка стоимости */}
      <div className="border-t border-white/10 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-gray">
            Аренда ({quantity} {rentalType === 'shift' ? 'смен' : 'ч.'} × {(rentalType === 'shift' ? shiftPrice : hourlyPrice || 0).toLocaleString('ru-RU')} ₽)
          </span>
          <span className="text-white">{rentalCost.toLocaleString('ru-RU')} ₽</span>
        </div>
        {deliveryKm > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-text-gray">
              Доставка ({deliveryKm} км × {DELIVERY_PRICE_PER_KM} ₽ × 2)
            </span>
            <span className="text-white">{deliveryCost.toLocaleString('ru-RU')} ₽</span>
          </div>
        )}
      </div>

      {/* Итого */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-text-gray font-medium">Итого:</span>
          <span className="text-3xl font-display font-bold text-accent">
            {totalPrice.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>
    </div>
  )
}
