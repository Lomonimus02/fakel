'use client'

import { useState, useEffect } from 'react'
import { updateSiteSettings, getSiteSettingsAction, uploadContractFile } from '@/lib/actions/settings'
import { Save, Phone, Mail, MapPin, Clock, ArrowLeft, FileText } from 'lucide-react'
import { TelegramIcon, WhatsAppIcon } from '@/components/shared'
import Link from 'next/link'

interface SettingsForm {
  phone: string
  email: string
  address: string
  workingHours: string
  telegramUrl: string
  whatsappUrl: string
  mapIframe: string
  contractUrl: string
}

const defaultSettings: SettingsForm = {
  phone: '',
  email: '',
  address: '',
  workingHours: '',
  telegramUrl: '',
  whatsappUrl: '',
  mapIframe: '',
  contractUrl: '',
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsForm>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [isUploadingContract, setIsUploadingContract] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setIsLoading(true)
    const data = await getSiteSettingsAction()
    if (data) {
      setSettings({
        phone: data.phone,
        email: data.email,
        address: data.address,
        workingHours: data.workingHours,
        telegramUrl: data.telegramUrl || '',
        whatsappUrl: data.whatsappUrl || '',
        mapIframe: data.mapIframe || '',
        contractUrl: data.contractUrl || '',
      })
    }
    setIsLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    // Загружаем PDF договора если выбран файл
    let contractUrl: string | undefined = undefined
    if (contractFile) {
      setIsUploadingContract(true)
      const fd = new FormData()
      fd.append('file', contractFile)
      const uploadResult = await uploadContractFile(fd)
      setIsUploadingContract(false)

      if (uploadResult.success && uploadResult.url) {
        contractUrl = uploadResult.url
        setSettings(prev => ({ ...prev, contractUrl: uploadResult.url! }))
        setContractFile(null)
      } else {
        setMessage({ type: 'error', text: uploadResult.error || 'Ошибка загрузки договора' })
        setIsSaving(false)
        return
      }
    }

    // Конвертируем telegram username в URL
    const telegramUrl = settings.telegramUrl 
      ? `https://t.me/${settings.telegramUrl.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '')}`
      : null
    
    // Конвертируем whatsapp в URL
    const whatsappUrl = settings.whatsappUrl
      ? `https://wa.me/${settings.whatsappUrl.replace(/[^\d]/g, '')}`
      : null

    const result = await updateSiteSettings({
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      workingHours: settings.workingHours,
      telegramUrl,
      whatsappUrl,
      mapIframe: settings.mapIframe || null,
      ...(contractUrl !== undefined && { contractUrl }),
    })

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Сохранено' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Ошибка' })
    }
    
    setIsSaving(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Шапка */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Настройки сайта</h1>
            <p className="text-gray-400 mt-1">Контактные данные и мессенджеры</p>
          </div>
        </div>

      {/* Сообщение */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Форма */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основные контакты */}
        <div className="bg-surface border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-accent" />
            Основные контакты
          </h2>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">
                Телефон
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-white"
                placeholder="+7 (812) 999-00-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-white"
                placeholder="info@iron-rent.ru"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Адрес
              </label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-white"
                placeholder="Санкт-Петербург, ул. Строителей 15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-gray mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Режим работы
              </label>
              <input
                type="text"
                name="workingHours"
                value={settings.workingHours}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-white"
                placeholder="Круглосуточно, 24/7"
              />
            </div>
          </div>
        </div>

        {/* Мессенджеры */}
        <div className="bg-surface border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Мессенджеры</h2>
          
          <div className="grid gap-6">
            {/* Telegram */}
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 flex items-center gap-2">
                <TelegramIcon size={18} className="text-[#0088cc]" />
                Telegram
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray">@</span>
                <input
                  type="text"
                  name="telegramUrl"
                  value={settings.telegramUrl.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '')}
                  onChange={(e) => {
                    const value = e.target.value.replace(/^@/, '')
                    setSettings(prev => ({ ...prev, telegramUrl: value }))
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-white"
                  placeholder="planteo"
                />
              </div>
              <p className="text-xs text-text-gray mt-1">Введите имя без @</p>
            </div>
            
            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-text-gray mb-2 flex items-center gap-2">
                <WhatsAppIcon size={18} className="text-[#25D366]" />
                WhatsApp
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-gray">+</span>
                <input
                  type="text"
                  name="whatsappUrl"
                  value={settings.whatsappUrl.replace(/^https?:\/\/wa\.me\//, '').replace(/^\+/, '')}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '')
                    setSettings(prev => ({ ...prev, whatsappUrl: value }))
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-white"
                  placeholder="78129990000"
                />
              </div>
              <p className="text-xs text-text-gray mt-1">Номер телефона с кодом страны (только цифры)</p>
            </div>
          </div>
        </div>

        {/* Карта */}
        <div className="bg-surface border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            Карта
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">
              HTML-код iframe карты (Яндекс/Google)
            </label>
            <textarea
              name="mapIframe"
              value={settings.mapIframe}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-white font-mono text-sm"
              placeholder='<iframe src="https://yandex.ru/map-widget/..." ...></iframe>'
            />
            <p className="text-xs text-text-gray mt-2">
              Скопируйте код для встраивания карты с Яндекс.Карт или Google Maps
            </p>
          </div>
        </div>

        {/* Типовой договор */}
        <div className="bg-surface border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            Типовой договор (PDF)
          </h2>

          {settings.contractUrl && (
            <div className="mb-4 flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-accent" />
              <a
                href={settings.contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Текущий договор
              </a>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-gray mb-2">
              Загрузить новый файл
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setContractFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 bg-dark border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-dark hover:file:bg-accent/90 file:cursor-pointer cursor-pointer"
            />
            {contractFile && (
              <p className="text-xs text-accent mt-2">
                Выбран: {contractFile.name}
              </p>
            )}
            {isUploadingContract && (
              <p className="text-xs text-text-gray mt-2 flex items-center gap-2">
                <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-accent inline-block"></span>
                Загрузка...
              </p>
            )}
            <p className="text-xs text-text-gray mt-2">
              Загрузите PDF-файл типового договора. Ссылка на скачивание появится в футере сайта.
            </p>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-dark font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark"></div>
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Сохранить
              </>
            )}
          </button>
          
          <Link
            href="/admin"
            className="px-6 py-3 bg-surface border border-white/10 hover:border-white/20 text-white font-medium rounded-lg transition-colors"
          >
            Отмена
          </Link>
        </div>
      </form>
      </div>
    </div>
  )
}
