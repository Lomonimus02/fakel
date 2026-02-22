'use client'

import Marquee from 'react-fast-marquee'

// SVG логотипы клиентов
const LSRLogo = () => (
  <svg viewBox="0 0 120 40" className="h-8 md:h-10 w-auto">
    <rect x="2" y="8" width="24" height="24" rx="2" fill="#E31E24"/>
    <text x="8" y="26" fontSize="14" fontWeight="bold" fill="white">ЛС</text>
    <text x="30" y="28" fontSize="20" fontWeight="bold" fill="currentColor">ЛСР</text>
  </svg>
)

const EtalonLogo = () => (
  <svg viewBox="0 0 130 40" className="h-8 md:h-10 w-auto">
    <path d="M5 20 L15 8 L25 20 L15 32 Z" fill="#1E3A8A"/>
    <path d="M15 12 L22 20 L15 28 L8 20 Z" fill="#3B82F6"/>
    <text x="32" y="27" fontSize="18" fontWeight="600" fill="currentColor" fontFamily="Arial, sans-serif">ЭТАЛОН</text>
  </svg>
)

const GazpromLogo = () => (
  <svg viewBox="0 0 140 40" className="h-8 md:h-10 w-auto">
    <ellipse cx="20" cy="20" rx="16" ry="16" fill="none" stroke="#0066B3" strokeWidth="2"/>
    <path d="M12 28 Q20 8 28 28" fill="none" stroke="#0066B3" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="20" cy="14" r="3" fill="#FF6B00"/>
    <text x="42" y="27" fontSize="16" fontWeight="bold" fill="currentColor" fontFamily="Arial, sans-serif">ГАЗПРОМ</text>
  </svg>
)

const PIKLogo = () => (
  <svg viewBox="0 0 100 40" className="h-8 md:h-10 w-auto">
    <rect x="4" y="6" width="28" height="28" rx="4" fill="#E31E24"/>
    <text x="8" y="27" fontSize="16" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">ПИК</text>
    <text x="38" y="27" fontSize="18" fontWeight="bold" fill="currentColor" fontFamily="Arial, sans-serif">ПИК</text>
  </svg>
)

const SetlLogo = () => (
  <svg viewBox="0 0 150 40" className="h-8 md:h-10 w-auto">
    <rect x="4" y="10" width="20" height="20" fill="#1E40AF"/>
    <rect x="8" y="14" width="12" height="12" fill="#3B82F6"/>
    <rect x="11" y="17" width="6" height="6" fill="white"/>
    <text x="30" y="27" fontSize="15" fontWeight="600" fill="currentColor" fontFamily="Arial, sans-serif">SETL GROUP</text>
  </svg>
)

const SamoletLogo = () => (
  <svg viewBox="0 0 140 40" className="h-8 md:h-10 w-auto">
    <path d="M8 24 L28 14 L28 18 L12 26 L28 26 L28 30 L8 24 Z" fill="#FF4D00"/>
    <circle cx="26" cy="22" r="3" fill="#FF4D00"/>
    <text x="36" y="27" fontSize="15" fontWeight="600" fill="currentColor" fontFamily="Arial, sans-serif">САМОЛЁТ</text>
  </svg>
)

const MetrostroyLogo = () => (
  <svg viewBox="0 0 160 40" className="h-8 md:h-10 w-auto">
    <path d="M6 30 L14 10 L20 22 L26 10 L34 30" fill="none" stroke="#E31E24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="42" y="27" fontSize="14" fontWeight="600" fill="currentColor" fontFamily="Arial, sans-serif">МЕТРОСТРОЙ</text>
  </svg>
)

const GlavstroyLogo = () => (
  <svg viewBox="0 0 160 40" className="h-8 md:h-10 w-auto">
    <rect x="4" y="8" width="8" height="24" fill="#1E3A8A"/>
    <rect x="14" y="14" width="8" height="18" fill="#2563EB"/>
    <rect x="24" y="10" width="8" height="22" fill="#3B82F6"/>
    <text x="38" y="27" fontSize="14" fontWeight="600" fill="currentColor" fontFamily="Arial, sans-serif">ГЛАВСТРОЙ</text>
  </svg>
)

const RosatomLogo = () => (
  <svg viewBox="0 0 140 40" className="h-8 md:h-10 w-auto">
    <circle cx="20" cy="20" r="14" fill="none" stroke="#00A3E0" strokeWidth="2"/>
    <ellipse cx="20" cy="20" rx="14" ry="6" fill="none" stroke="#00A3E0" strokeWidth="1.5" transform="rotate(60 20 20)"/>
    <ellipse cx="20" cy="20" rx="14" ry="6" fill="none" stroke="#00A3E0" strokeWidth="1.5" transform="rotate(-60 20 20)"/>
    <circle cx="20" cy="20" r="3" fill="#00A3E0"/>
    <text x="40" y="27" fontSize="14" fontWeight="600" fill="currentColor" fontFamily="Arial, sans-serif">РОСАТОМ</text>
  </svg>
)

const RZDLogo = () => (
  <svg viewBox="0 0 100 40" className="h-8 md:h-10 w-auto">
    <rect x="4" y="8" width="30" height="24" rx="3" fill="#E31E24"/>
    <text x="8" y="26" fontSize="12" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">РЖД</text>
    <text x="40" y="27" fontSize="18" fontWeight="bold" fill="currentColor" fontFamily="Arial, sans-serif">РЖД</text>
  </svg>
)

const clients = [
  { name: 'ЛСР', Logo: LSRLogo },
  { name: 'Эталон', Logo: EtalonLogo },
  { name: 'Газпром', Logo: GazpromLogo },
  { name: 'ПИК', Logo: PIKLogo },
  { name: 'Сетл Групп', Logo: SetlLogo },
  { name: 'Самолёт', Logo: SamoletLogo },
  { name: 'Метрострой', Logo: MetrostroyLogo },
  { name: 'Главстрой', Logo: GlavstroyLogo },
  { name: 'Росатом', Logo: RosatomLogo },
  { name: 'РЖД', Logo: RZDLogo },
]

export function ClientsMarquee() {
  return (
    <section className="py-10 md:py-14 bg-dark relative overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-center gap-4">
          <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-white/20" />
          <p className="text-center text-sm md:text-base font-medium text-gray-400 uppercase tracking-[0.2em]">
            Нам доверяют
          </p>
          <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </div>
      
      <Marquee
        gradient={false}
        speed={25}
        pauseOnHover={true}
        className="py-2"
      >
        {clients.map((client, index) => (
          <div
            key={index}
            className="mx-8 md:mx-12 group"
          >
            <div className="px-6 py-4 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] hover:border-accent/30 hover:bg-white/[0.06] transition-all duration-300 flex items-center justify-center min-w-[160px] md:min-w-[180px]">
              <div className="text-gray-400 group-hover:text-white transition-colors duration-300 opacity-70 group-hover:opacity-100">
                <client.Logo />
              </div>
            </div>
          </div>
        ))}
      </Marquee>
    </section>
  )
}
