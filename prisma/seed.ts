import 'dotenv/config'
import { PrismaClient, LeadStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seedAdminAndSettings() {
  console.log('👤 Проверяем/создаём админа и настройки...')

  // Создаём дефолтного админа если его нет
  const existingAdmin = await prisma.adminUser.findFirst()
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 12)
    await prisma.adminUser.create({
      data: {
        email: 'admin@iron-rent.ru',
        passwordHash,
      },
    })
    console.log('✅ Создан админ: admin@iron-rent.ru / admin123')
  } else {
    console.log('ℹ️ Админ уже существует')
  }

  // Создаём дефолтные настройки сайта если их нет
  const existingSettings = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        id: 1,
        phone: '+7 (812) 999-00-00',
        email: 'spb@iron-rent.ru',
        address: 'Санкт-Петербург, ул. Строителей 15, офис 204',
        workingHours: 'Круглосуточно, 24/7',
        telegramUrl: 'https://t.me/ironrent',
      },
    })
    console.log('✅ Созданы настройки сайта')
  } else {
    console.log('ℹ️ Настройки сайта уже существуют')
  }
}

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

  // Сначала создаём админа и настройки (они не удаляются)
  await seedAdminAndSettings()

  // Очистка существующих данных (учитываем EAV таблицы)
  console.log('🗑️ Очищаем данные...')
  await prisma.productAttributeValue.deleteMany()
  await prisma.categoryAttribute.deleteMany()
  await prisma.attribute.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.machine.deleteMany()
  await prisma.category.deleteMany()

  console.log('📦 Создаём атрибуты (EAV)...')

  // Создание EAV атрибутов
  const attrWeight = await prisma.attribute.create({
    data: { name: 'Масса', slug: 'weight', type: 'number', unit: 'т' },
  })
  const attrBucketVolume = await prisma.attribute.create({
    data: { name: 'Объём ковша', slug: 'bucket-volume', type: 'number', unit: 'м³' },
  })
  const attrMaxDepth = await prisma.attribute.create({
    data: { name: 'Макс. глубина копания', slug: 'max-depth', type: 'number', unit: 'м' },
  })
  const attrMaxReach = await prisma.attribute.create({
    data: { name: 'Макс. вылет', slug: 'max-reach', type: 'number', unit: 'м' },
  })
  const attrEngine = await prisma.attribute.create({
    data: { name: 'Двигатель', slug: 'engine', type: 'string', unit: null },
  })
  const attrYear = await prisma.attribute.create({
    data: { name: 'Год выпуска', slug: 'year', type: 'number', unit: null },
  })
  const attrLiftingCapacity = await prisma.attribute.create({
    data: { name: 'Грузоподъёмность', slug: 'lifting-capacity', type: 'number', unit: 'т' },
  })
  const attrBoomLength = await prisma.attribute.create({
    data: { name: 'Длина стрелы', slug: 'boom-length', type: 'number', unit: 'м' },
  })
  const attrMaxHeight = await prisma.attribute.create({
    data: { name: 'Макс. высота подъёма', slug: 'max-height', type: 'number', unit: 'м' },
  })
  const attrAxles = await prisma.attribute.create({
    data: { name: 'Количество осей', slug: 'axles', type: 'number', unit: null },
  })
  const attrChassis = await prisma.attribute.create({
    data: { name: 'Шасси', slug: 'chassis', type: 'string', unit: null },
  })
  const attrBucketCapacity = await prisma.attribute.create({
    data: { name: 'Объём ковша', slug: 'bucket-capacity', type: 'number', unit: 'м³' },
  })
  const attrOperatingWeight = await prisma.attribute.create({
    data: { name: 'Эксплуатационная масса', slug: 'operating-weight', type: 'number', unit: 'т' },
  })
  const attrMaxSpeed = await prisma.attribute.create({
    data: { name: 'Макс. скорость', slug: 'max-speed', type: 'number', unit: 'км/ч' },
  })
  const attrMaxLiftHeight = await prisma.attribute.create({
    data: { name: 'Макс. высота подъёма', slug: 'max-lift-height', type: 'number', unit: 'м' },
  })
  const attrMaxLoadCapacity = await prisma.attribute.create({
    data: { name: 'Макс. грузоподъёмность', slug: 'max-load-capacity', type: 'number', unit: 'т' },
  })
  const attrBladeCapacity = await prisma.attribute.create({
    data: { name: 'Объём отвала', slug: 'blade-capacity', type: 'number', unit: 'м³' },
  })
  const attrBladeWidth = await prisma.attribute.create({
    data: { name: 'Ширина отвала', slug: 'blade-width', type: 'number', unit: 'м' },
  })

  console.log('📦 Создаём категории...')

  // Создание категорий
  const excavators = await prisma.category.create({
    data: {
      name: 'Экскаваторы',
      slug: 'excavators',
      description: 'Аренда гусеничных и колёсных экскаваторов для земляных работ любой сложности',
      imageUrl: '/images/categories/excavators.jpg',
    },
  })

  const cranes = await prisma.category.create({
    data: {
      name: 'Краны',
      slug: 'cranes',
      description: 'Автокраны и башенные краны для строительных и монтажных работ',
      imageUrl: '/images/categories/cranes.jpg',
    },
  })

  const loaders = await prisma.category.create({
    data: {
      name: 'Погрузчики',
      slug: 'loaders',
      description: 'Фронтальные и телескопические погрузчики для складских и строительных работ',
      imageUrl: '/images/categories/loaders.jpg',
    },
  })

  const bulldozers = await prisma.category.create({
    data: {
      name: 'Бульдозеры',
      slug: 'bulldozers',
      description: 'Мощные бульдозеры для планировки территории и земляных работ',
      imageUrl: '/images/categories/bulldozers.jpg',
    },
  })

  console.log('🔗 Привязываем атрибуты к категориям...')

  // Привязка атрибутов к категориям (CategoryAttribute)
  // Экскаваторы
  await prisma.categoryAttribute.createMany({
    data: [
      { categoryId: excavators.id, attributeId: attrWeight.id, isFilter: true, order: 1 },
      { categoryId: excavators.id, attributeId: attrBucketVolume.id, isFilter: true, order: 2 },
      { categoryId: excavators.id, attributeId: attrMaxDepth.id, isFilter: true, order: 3 },
      { categoryId: excavators.id, attributeId: attrMaxReach.id, isFilter: false, order: 4 },
      { categoryId: excavators.id, attributeId: attrEngine.id, isFilter: false, order: 5 },
      { categoryId: excavators.id, attributeId: attrYear.id, isFilter: false, order: 6 },
    ],
  })

  // Краны
  await prisma.categoryAttribute.createMany({
    data: [
      { categoryId: cranes.id, attributeId: attrLiftingCapacity.id, isFilter: true, order: 1 },
      { categoryId: cranes.id, attributeId: attrBoomLength.id, isFilter: true, order: 2 },
      { categoryId: cranes.id, attributeId: attrMaxHeight.id, isFilter: true, order: 3 },
      { categoryId: cranes.id, attributeId: attrAxles.id, isFilter: false, order: 4 },
      { categoryId: cranes.id, attributeId: attrChassis.id, isFilter: false, order: 5 },
      { categoryId: cranes.id, attributeId: attrEngine.id, isFilter: false, order: 6 },
      { categoryId: cranes.id, attributeId: attrYear.id, isFilter: false, order: 7 },
    ],
  })

  // Погрузчики
  await prisma.categoryAttribute.createMany({
    data: [
      { categoryId: loaders.id, attributeId: attrBucketCapacity.id, isFilter: true, order: 1 },
      { categoryId: loaders.id, attributeId: attrOperatingWeight.id, isFilter: true, order: 2 },
      { categoryId: loaders.id, attributeId: attrLiftingCapacity.id, isFilter: true, order: 3 },
      { categoryId: loaders.id, attributeId: attrMaxSpeed.id, isFilter: false, order: 4 },
      { categoryId: loaders.id, attributeId: attrMaxLiftHeight.id, isFilter: false, order: 5 },
      { categoryId: loaders.id, attributeId: attrMaxLoadCapacity.id, isFilter: false, order: 6 },
      { categoryId: loaders.id, attributeId: attrEngine.id, isFilter: false, order: 7 },
      { categoryId: loaders.id, attributeId: attrYear.id, isFilter: false, order: 8 },
    ],
  })

  // Бульдозеры
  await prisma.categoryAttribute.createMany({
    data: [
      { categoryId: bulldozers.id, attributeId: attrOperatingWeight.id, isFilter: true, order: 1 },
      { categoryId: bulldozers.id, attributeId: attrBladeCapacity.id, isFilter: true, order: 2 },
      { categoryId: bulldozers.id, attributeId: attrBladeWidth.id, isFilter: false, order: 3 },
      { categoryId: bulldozers.id, attributeId: attrEngine.id, isFilter: false, order: 4 },
      { categoryId: bulldozers.id, attributeId: attrYear.id, isFilter: false, order: 5 },
    ],
  })

  console.log('🚜 Создаём технику...')

  // Хелпер для создания машины с атрибутами
  async function createMachineWithAttrs(
    machineData: {
      title: string
      slug: string
      categoryId: number
      shiftPrice: number
      hourlyPrice: number
      description: string
      isFeatured?: boolean
      isAvailable?: boolean
    },
    attrs: { attributeId: number; valueNumber?: number; valueString?: string }[]
  ) {
    const machine = await prisma.machine.create({
      data: {
        ...machineData,
        specs: {},
        imageUrl: null,
        images: [],
        isFeatured: machineData.isFeatured ?? false,
        isAvailable: machineData.isAvailable ?? true,
      },
    })

    // Создаём значения атрибутов
    if (attrs.length > 0) {
      await prisma.productAttributeValue.createMany({
        data: attrs.map(a => ({
          machineId: machine.id,
          attributeId: a.attributeId,
          valueNumber: a.valueNumber ?? null,
          valueString: a.valueString ?? null,
        })),
      })
    }

    return machine
  }

  // Хелпер для генерации случайного числа в диапазоне
  function randomInRange(min: number, max: number, decimals = 1): number {
    const value = Math.random() * (max - min) + min
    return Number(value.toFixed(decimals))
  }

  // Хелпер для выбора случайного элемента из массива
  function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  // ============ ЭКСКАВАТОРЫ (20 шт) ============
  const excavatorModels = [
    { brand: 'JCB', models: ['JS130', 'JS160', 'JS180', 'JS200', 'JS220', 'JS240', 'JS260', 'JS300', 'JS330', 'JS370'] },
    { brand: 'Hitachi', models: ['ZX130', 'ZX200', 'ZX250', 'ZX300', 'ZX350', 'ZX400', 'ZX470', 'ZX520', 'ZX650', 'ZX870'] },
    { brand: 'Komatsu', models: ['PC130', 'PC200', 'PC210', 'PC240', 'PC270', 'PC300', 'PC350', 'PC400', 'PC450', 'PC490'] },
    { brand: 'Volvo', models: ['EC140', 'EC200', 'EC220', 'EC250', 'EC300', 'EC350', 'EC380', 'EC480', 'EC530', 'EC750'] },
    { brand: 'Caterpillar', models: ['320', '323', '325', '330', '336', '340', '349', '352', '374', '390'] },
  ]
  const excavatorEngines = [
    'JCB Dieselmax 97 кВт', 'JCB Dieselmax 129 кВт', 'JCB Dieselmax 160 кВт',
    'Isuzu 4HK1X 140 кВт', 'Isuzu 6HK1X 202 кВт', 'Isuzu 6WG1X 270 кВт',
    'Komatsu SAA4D107E 93 кВт', 'Komatsu SAA6D107E 155 кВт', 'Komatsu SAA6D114E 205 кВт',
    'Volvo D6E 129 кВт', 'Volvo D8J 220 кВт', 'Volvo D13J 330 кВт',
    'Cat C4.4 ACERT 97 кВт', 'Cat C7.1 ACERT 168 кВт', 'Cat C9.3 ACERT 243 кВт',
  ]

  let excavatorIndex = 0
  for (let i = 0; i < 20; i++) {
    const brandInfo = excavatorModels[i % excavatorModels.length]
    const model = brandInfo.models[Math.floor(i / excavatorModels.length) % brandInfo.models.length]
    const weight = randomInRange(13, 50, 1)
    const bucketVolume = randomInRange(0.5, 2.5, 2)
    const maxDepth = randomInRange(5, 9, 1)
    const maxReach = randomInRange(8, 14, 1)
    const year = 2018 + Math.floor(Math.random() * 8)
    const basePrice = Math.round(15000 + weight * 600)
    const hourlyPrice = Math.round(basePrice / 7)

    await createMachineWithAttrs(
      {
        title: `Экскаватор ${brandInfo.brand} ${model}`,
        slug: `${brandInfo.brand.toLowerCase()}-${model.toLowerCase()}-${i + 1}`,
        categoryId: excavators.id,
        shiftPrice: basePrice,
        hourlyPrice: hourlyPrice,
        description: `Гусеничный экскаватор ${brandInfo.brand} ${model} массой ${weight} т — надёжная и производительная машина для земляных работ любой сложности.

Идеально подходит для:
- Рытьё котлованов и траншей
- Погрузочно-разгрузочные работы
- Снос зданий и сооружений
- Планировка территории

Экскаватор оснащён современной кабиной с климат-контролем и отличным обзором. Предоставляется с опытным машинистом.`,
        isFeatured: i < 3,
        isAvailable: i !== 5, // один недоступен для разнообразия
      },
      [
        { attributeId: attrWeight.id, valueNumber: weight },
        { attributeId: attrBucketVolume.id, valueNumber: bucketVolume },
        { attributeId: attrMaxDepth.id, valueNumber: maxDepth },
        { attributeId: attrMaxReach.id, valueNumber: maxReach },
        { attributeId: attrEngine.id, valueString: randomChoice(excavatorEngines) },
        { attributeId: attrYear.id, valueNumber: year },
      ]
    )
    excavatorIndex++
  }
  console.log(`   ✅ Создано экскаваторов: ${excavatorIndex}`)

  // ============ КРАНЫ (20 шт) ============
  const craneModels = [
    { brand: 'Liebherr', models: ['LTM 1030', 'LTM 1040', 'LTM 1050', 'LTM 1060', 'LTM 1070', 'LTM 1090', 'LTM 1100', 'LTM 1130', 'LTM 1160', 'LTM 1200'] },
    { brand: 'Grove', models: ['GMK3050', 'GMK3060', 'GMK4080', 'GMK4100', 'GMK5120', 'GMK5150', 'GMK5180', 'GMK5200', 'GMK5250', 'GMK6300'] },
    { brand: 'Terex', models: ['AC40', 'AC55', 'AC60', 'AC80', 'AC100', 'AC160', 'AC200', 'AC250', 'AC350', 'AC500'] },
    { brand: 'Zoomlion', models: ['ZTC250', 'ZTC350', 'ZTC500', 'ZTC550', 'ZTC650', 'ZTC800', 'ZTC1000', 'ZTC1100', 'ZTC1300', 'ZTC2000'] },
    { brand: 'XCMG', models: ['XCA60', 'XCA100', 'XCA130', 'XCA160', 'XCA220', 'XCA260', 'XCA300', 'XCA350', 'XCA450', 'XCA550'] },
  ]
  const craneEngines = [
    'Liebherr D936 180 кВт', 'Liebherr D946 330 кВт', 'Liebherr D956 370 кВт',
    'Cummins QSB6.7 186 кВт', 'Cummins QSL9 260 кВт', 'Cummins QSX15 400 кВт',
    'Mercedes-Benz OM471 350 кВт', 'Mercedes-Benz OM473 460 кВт',
    'Volvo D11 305 кВт', 'Volvo D13 375 кВт',
  ]
  const chassisTypes = ['КамАЗ-65115', 'КамАЗ-65201', 'МАЗ-6312', 'MAN TGS', 'Volvo FMX', 'Mercedes-Benz Actros', 'Scania P-series']

  let craneIndex = 0
  for (let i = 0; i < 20; i++) {
    const brandInfo = craneModels[i % craneModels.length]
    const model = brandInfo.models[Math.floor(i / craneModels.length) % brandInfo.models.length]
    const liftingCapacity = randomInRange(25, 200, 0)
    const boomLength = randomInRange(20, 70, 1)
    const maxHeight = randomInRange(25, 100, 0)
    const axles = Math.floor(randomInRange(3, 6, 0))
    const year = 2017 + Math.floor(Math.random() * 9)
    const basePrice = Math.round(20000 + liftingCapacity * 300)
    const hourlyPrice = Math.round(basePrice / 7)

    await createMachineWithAttrs(
      {
        title: `Автокран ${brandInfo.brand} ${model}`,
        slug: `${brandInfo.brand.toLowerCase()}-${model.toLowerCase().replace(/\s/g, '-')}-${i + 1}`,
        categoryId: cranes.id,
        shiftPrice: basePrice,
        hourlyPrice: hourlyPrice,
        description: `Мобильный автокран ${brandInfo.brand} ${model} грузоподъёмностью ${liftingCapacity} тонн — универсальное решение для строительных и монтажных работ.

Применение:
- Монтаж металлоконструкций
- Установка башенных кранов
- Подъём тяжёлого оборудования
- Строительство мостов и эстакад

Кран оснащён системой телескопирования и может работать в стеснённых условиях.`,
        isFeatured: i < 3,
        isAvailable: i !== 7,
      },
      [
        { attributeId: attrLiftingCapacity.id, valueNumber: liftingCapacity },
        { attributeId: attrBoomLength.id, valueNumber: boomLength },
        { attributeId: attrMaxHeight.id, valueNumber: maxHeight },
        { attributeId: attrAxles.id, valueNumber: axles },
        { attributeId: attrChassis.id, valueString: randomChoice(chassisTypes) },
        { attributeId: attrEngine.id, valueString: randomChoice(craneEngines) },
        { attributeId: attrYear.id, valueNumber: year },
      ]
    )
    craneIndex++
  }
  console.log(`   ✅ Создано кранов: ${craneIndex}`)

  // ============ ПОГРУЗЧИКИ (20 шт) ============
  const loaderModels = [
    { brand: 'Caterpillar', models: ['924K', '930M', '938M', '950M', '962M', '966M', '972M', '980M', '988K', '992K'], type: 'Фронтальный погрузчик' },
    { brand: 'Volvo', models: ['L60H', 'L70H', 'L90H', 'L110H', 'L120H', 'L150H', 'L180H', 'L220H', 'L260H', 'L350H'], type: 'Фронтальный погрузчик' },
    { brand: 'JCB', models: ['520-40', '525-60', '531-70', '535-95', '535-140', '540-140', '540-170', '540-200', '541-70', '560-80'], type: 'Телескопический погрузчик' },
    { brand: 'Manitou', models: ['MT625', 'MT732', 'MT835', 'MT932', 'MT1030', 'MT1135', 'MT1235', 'MT1335', 'MT1440', 'MT1840'], type: 'Телескопический погрузчик' },
    { brand: 'Komatsu', models: ['WA100', 'WA200', 'WA270', 'WA320', 'WA380', 'WA430', 'WA470', 'WA500', 'WA600', 'WA700'], type: 'Фронтальный погрузчик' },
  ]
  const loaderEngines = [
    'Cat C4.4 ACERT 97 кВт', 'Cat C7.1 ACERT 168 кВт', 'Cat C9.3 ACERT 212 кВт', 'Cat C13 ACERT 298 кВт',
    'Volvo D6J 129 кВт', 'Volvo D8J 186 кВт', 'Volvo D11J 265 кВт', 'Volvo D13J 330 кВт',
    'JCB EcoMAX 55 кВт', 'JCB EcoMAX 74 кВт', 'JCB EcoMAX 97 кВт', 'JCB EcoMAX 129 кВт',
    'Komatsu SAA4D107E 93 кВт', 'Komatsu SAA6D107E 155 кВт', 'Komatsu SAA6D114E 205 кВт',
  ]

  let loaderIndex = 0
  for (let i = 0; i < 20; i++) {
    const brandInfo = loaderModels[i % loaderModels.length]
    const model = brandInfo.models[Math.floor(i / loaderModels.length) % brandInfo.models.length]
    const isTelescopic = brandInfo.type.includes('Телескопический')
    const bucketCapacity = randomInRange(1.5, 6, 1)
    const operatingWeight = randomInRange(8, 35, 1)
    const liftingCapacity = randomInRange(3, 12, 1)
    const maxSpeed = randomInRange(30, 50, 0)
    const maxLiftHeight = isTelescopic ? randomInRange(10, 20, 1) : randomInRange(3, 6, 1)
    const maxLoadCapacity = randomInRange(2.5, 8, 1)
    const year = 2018 + Math.floor(Math.random() * 8)
    const basePrice = Math.round(12000 + operatingWeight * 400)
    const hourlyPrice = Math.round(basePrice / 7)

    await createMachineWithAttrs(
      {
        title: `${brandInfo.type} ${brandInfo.brand} ${model}`,
        slug: `${brandInfo.brand.toLowerCase()}-${model.toLowerCase().replace(/\s/g, '-')}-${i + 1}`,
        categoryId: loaders.id,
        shiftPrice: basePrice,
        hourlyPrice: hourlyPrice,
        description: `${brandInfo.type} ${brandInfo.brand} ${model} — универсальная машина для строительных площадок и складов.

Возможности:
- Погрузка и разгрузка материалов
- Перемещение сыпучих грузов
- ${isTelescopic ? 'Подача материалов на высоту' : 'Уборка территории'}
- Работа с вилами и другим навесным оборудованием

Погрузчик отличается высокой маневренностью и производительностью.`,
        isFeatured: i < 3,
        isAvailable: i !== 11,
      },
      [
        { attributeId: attrBucketCapacity.id, valueNumber: bucketCapacity },
        { attributeId: attrOperatingWeight.id, valueNumber: operatingWeight },
        { attributeId: attrLiftingCapacity.id, valueNumber: liftingCapacity },
        { attributeId: attrMaxSpeed.id, valueNumber: maxSpeed },
        { attributeId: attrMaxLiftHeight.id, valueNumber: maxLiftHeight },
        { attributeId: attrMaxLoadCapacity.id, valueNumber: maxLoadCapacity },
        { attributeId: attrEngine.id, valueString: randomChoice(loaderEngines) },
        { attributeId: attrYear.id, valueNumber: year },
      ]
    )
    loaderIndex++
  }
  console.log(`   ✅ Создано погрузчиков: ${loaderIndex}`)

  // ============ БУЛЬДОЗЕРЫ (20 шт) ============
  const bulldozerModels = [
    { brand: 'Komatsu', models: ['D31PX', 'D37PX', 'D39PX', 'D51PX', 'D61PX', 'D65EX', 'D85EX', 'D155AX', 'D275AX', 'D375A'] },
    { brand: 'Caterpillar', models: ['D3K2', 'D4K2', 'D5K2', 'D6K2', 'D6N', 'D6T', 'D7E', 'D8T', 'D9T', 'D10T'] },
    { brand: 'John Deere', models: ['450K', '550K', '650K', '700K', '750K', '850K', '950K', '1050K', '1150K', '1250K'] },
    { brand: 'Liebherr', models: ['PR716', 'PR726', 'PR736', 'PR746', 'PR756', 'PR766', 'PR776'] },
    { brand: 'Shantui', models: ['SD08', 'SD13', 'SD16', 'SD22', 'SD23', 'SD32', 'SD42', 'SD52', 'SD60', 'SD90'] },
  ]
  const bulldozerEngines = [
    'Komatsu SAA4D107E 93 кВт', 'Komatsu SAA6D107E 131 кВт', 'Komatsu SAA6D114E 169 кВт', 'Komatsu SAA6D125E 264 кВт',
    'Cat C4.4 ACERT 79 кВт', 'Cat C7.1 ACERT 142 кВт', 'Cat C9.3 ACERT 212 кВт', 'Cat C15 ACERT 310 кВт',
    'John Deere PowerTech 6068 168 кВт', 'John Deere PowerTech 6090 246 кВт',
    'Liebherr D934 150 кВт', 'Liebherr D936 220 кВт', 'Liebherr D946 330 кВт',
    'Cummins QSB6.7 168 кВт', 'Cummins QSL9 224 кВт', 'Cummins QSX15 373 кВт',
  ]

  let bulldozerIndex = 0
  for (let i = 0; i < 20; i++) {
    const brandInfo = bulldozerModels[i % bulldozerModels.length]
    const model = brandInfo.models[Math.floor(i / bulldozerModels.length) % brandInfo.models.length]
    const operatingWeight = randomInRange(8, 70, 1)
    const bladeCapacity = randomInRange(2, 15, 1)
    const bladeWidth = randomInRange(2.5, 6, 1)
    const year = 2017 + Math.floor(Math.random() * 9)
    const basePrice = Math.round(18000 + operatingWeight * 400)
    const hourlyPrice = Math.round(basePrice / 7)

    await createMachineWithAttrs(
      {
        title: `Бульдозер ${brandInfo.brand} ${model}`,
        slug: `${brandInfo.brand.toLowerCase()}-${model.toLowerCase()}-${i + 1}`,
        categoryId: bulldozers.id,
        shiftPrice: basePrice,
        hourlyPrice: hourlyPrice,
        description: `Гусеничный бульдозер ${brandInfo.brand} ${model} массой ${operatingWeight} т — мощная машина для планировочных и земляных работ.

Преимущества:
- Высокая тяговая мощность
- Надёжная трансмиссия
- Современная система управления
- Комфортные условия работы оператора

Идеально подходит для планировки площадок, земляных работ и подготовки территорий.`,
        isFeatured: i < 3,
        isAvailable: i !== 15,
      },
      [
        { attributeId: attrOperatingWeight.id, valueNumber: operatingWeight },
        { attributeId: attrBladeCapacity.id, valueNumber: bladeCapacity },
        { attributeId: attrBladeWidth.id, valueNumber: bladeWidth },
        { attributeId: attrEngine.id, valueString: randomChoice(bulldozerEngines) },
        { attributeId: attrYear.id, valueNumber: year },
      ]
    )
    bulldozerIndex++
  }
  console.log(`   ✅ Создано бульдозеров: ${bulldozerIndex}`)

  console.log('📝 Создаём тестовые заявки...')

  // Тестовые заявки
  await prisma.lead.createMany({
    data: [
      {
        name: 'Иван Петров',
        phone: '+7 (999) 123-45-67',
        email: 'ivan@example.com',
        message: 'Интересует аренда экскаватора на неделю для рытья котлована',
        source: 'main_form',
        status: LeadStatus.NEW,
      },
      {
        name: 'ООО "СтройМонтаж"',
        phone: '+7 (495) 555-55-55',
        email: 'info@stroymontazh.ru',
        message: 'Нужен автокран 100т на 3 дня для монтажа конструкций',
        source: 'catalog',
        status: LeadStatus.PROCESSING,
      },
      {
        name: 'Сергей',
        phone: '+7 (926) 111-22-33',
        message: 'Погрузчик CAT на месяц, уточните цену',
        source: 'hero_form',
        status: LeadStatus.COMPLETED,
      },
    ],
  })

  console.log('🎉 База данных успешно заполнена!')
  
  // Вывод статистики
  const categoriesCount = await prisma.category.count()
  const machinesCount = await prisma.machine.count()
  const leadsCount = await prisma.lead.count()
  const adminsCount = await prisma.adminUser.count()
  const attributesCount = await prisma.attribute.count()
  const categoryAttributesCount = await prisma.categoryAttribute.count()
  const productAttributeValuesCount = await prisma.productAttributeValue.count()
  
  console.log(`
📊 Итоговая статистика:
   - Категорий: ${categoriesCount}
   - Техники: ${machinesCount}
   - Заявок: ${leadsCount}
   - Админов: ${adminsCount}
   - EAV атрибутов: ${attributesCount}
   - Связей категория-атрибут: ${categoryAttributesCount}
   - Значений атрибутов техники: ${productAttributeValuesCount}
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
