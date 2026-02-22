import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Декоративный элемент */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-surface border-2 border-accent/30">
            <svg 
              className="w-12 h-12 text-accent" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="font-display text-5xl md:text-6xl font-bold text-accent mb-6">
          404
          <span className="block text-white text-2xl md:text-3xl mt-2">
            Страница не найдена
          </span>
        </h1>

        {/* Описание */}
        <p className="text-text-gray text-lg mb-10 leading-relaxed">
          Возможно, техника была перемещена или ссылка устарела. 
          Давайте найдем то, что вам нужно.
        </p>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent hover:bg-accent-hover text-dark font-bold uppercase text-sm tracking-wide rounded-lg transition-all duration-300 hover:shadow-glow"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Перейти в каталог
          </Link>
          
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white/20 hover:border-accent text-white hover:text-accent font-bold uppercase text-sm tracking-wide rounded-lg transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            На главную
          </Link>
        </div>

        {/* Декоративная линия */}
        <div className="mt-16 flex items-center justify-center gap-2">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20"></div>
          <div className="w-2 h-2 rounded-full bg-accent/50"></div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20"></div>
        </div>
      </div>
    </div>
  )
}
