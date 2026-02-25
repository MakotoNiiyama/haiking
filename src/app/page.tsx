'use client'

import { useState } from 'react'
import { Home, User, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { FeedScreen } from '@/app/components/FeedScreen'
import { ComposeScreen } from '@/app/components/ComposeScreen'
import { DiscoverScreen } from '@/app/components/DiscoverScreen'
import { ProfileScreen } from '@/app/components/ProfileScreen'

type Tab = 'home' | 'discover' | 'compose' | 'profile'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')

  return (
    <div
      className="relative mx-auto bg-[#fafafa] overflow-hidden"
      style={{ maxWidth: '430px', height: '100dvh' }}
    >
      {/* Screen content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="h-full"
        >
          {activeTab === 'home' && (
            <FeedScreen onDiscoverTap={() => setActiveTab('discover')} />
          )}
          {activeTab === 'discover' && (
            <DiscoverScreen onBack={() => setActiveTab('home')} />
          )}
          {activeTab === 'compose' && (
            <ComposeScreen onBack={() => setActiveTab('home')} />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen onBack={() => setActiveTab('home')} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Compose Button */}
      {activeTab !== 'compose' && (
        <div
          className="absolute z-30"
          style={{ bottom: '40px', left: '50%', transform: 'translateX(-50%)' }}
        >
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => setActiveTab('compose')}
            className="bg-gray-900 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25)] active:scale-95 transition-transform flex items-center justify-center"
            style={{ width: '56px', height: '56px' }}
            aria-label="俳句をつくる"
          >
            <Plus size={26} strokeWidth={2.5} />
          </motion.button>
        </div>
      )}

      {/* Bottom Navigation */}
      {activeTab !== 'compose' && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-20">
          <div className="flex items-center justify-center gap-16 pt-2 pb-5">
            <NavTab
              active={activeTab === 'home'}
              icon={Home}
              label="ホーム"
              onClick={() => setActiveTab('home')}
            />
            {/* Center spacer for FAB */}
            <div style={{ width: '56px' }} />
            <NavTab
              active={activeTab === 'profile'}
              icon={User}
              label="わたし"
              onClick={() => setActiveTab('profile')}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function NavTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ComponentType<{ size: number; className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 px-5 py-1 transition-all"
    >
      <Icon
        size={22}
        className={`transition-colors ${active ? 'text-gray-900' : 'text-gray-400'}`}
      />
      <span
        className={`font-zen transition-colors text-[0.55rem] ${
          active ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </button>
  )
}
