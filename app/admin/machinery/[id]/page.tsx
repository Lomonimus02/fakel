import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getMachineWithAttributes, getCategoryAttributesForForm } from '@/lib/actions/machine'
import MachineForm from './MachineForm'

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>
}

export default async function MachineryEditPage({ params }: Props) {
  const { id } = await params

  // Получаем все категории для селекта (включая EAV атрибуты)
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      availableFilters: true,
      attributes: {
        include: {
          attribute: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  // Если id = "new", создаём новую запись
  if (id === 'new') {
    return (
      <div className="min-h-screen bg-dark">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold text-white mb-6">
            Добавить технику
          </h1>
          <MachineForm categories={categories} machineAttributes={[]} />
        </div>
      </div>
    )
  }

  // Иначе редактируем существующую
  const machineId = parseInt(id, 10)
  if (isNaN(machineId)) {
    notFound()
  }

  const machine = await getMachineWithAttributes(machineId)

  if (!machine) {
    notFound()
  }

  // Преобразуем Decimal в number для клиентского компонента
  // Prisma возвращает specs как JsonValue - преобразуем в Record или пустой объект
  let parsedSpecs: Record<string, string> = {}
  if (machine.specs && typeof machine.specs === 'object' && !Array.isArray(machine.specs)) {
    parsedSpecs = machine.specs as Record<string, string>
  }

  // Парсим badges - JSON массив строк
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const machineExt = machine as any
  let parsedBadges: string[] = []
  if (machineExt.badges && Array.isArray(machineExt.badges)) {
    parsedBadges = machineExt.badges as string[]
  }

  const machineData = {
    ...machine,
    shiftPrice: Number(machine.shiftPrice),
    hourlyPrice: machine.hourlyPrice ? Number(machine.hourlyPrice) : null,
    specs: parsedSpecs,
    badges: parsedBadges,
    loadChartUrl: machineExt.loadChartUrl || null,
    // Параметры для фильтрации (legacy)
    liftingCapacity: machineExt.liftingCapacity || null,
    boomLength: machineExt.boomLength || null,
    bucketVolume: machineExt.bucketVolume || null,
    diggingDepth: machineExt.diggingDepth || null,
    operatingWeight: machineExt.operatingWeight || null,
    isAllTerrain: machineExt.isAllTerrain || false,
  }

  // Преобразуем атрибуты машины в удобный формат
  const machineAttributes = machine.attributes.map(attr => ({
    attributeId: attr.attributeId,
    valueNumber: attr.valueNumber,
    valueString: attr.valueString,
    attribute: attr.attribute,
  }))

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-white mb-6">
          Редактировать: {machine.title}
        </h1>
        <MachineForm 
          machine={machineData} 
          categories={categories} 
          machineAttributes={machineAttributes}
        />
      </div>
    </div>
  )
}
