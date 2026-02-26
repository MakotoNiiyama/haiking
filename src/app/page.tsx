'use client'

import { useState } from 'react'
import { Plus, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { FeedScreen } from '@/app/components/FeedScreen'
import { ComposeScreen } from '@/app/components/ComposeScreen'
import type { Post } from '@/types'

type Tab = 'home' | 'compose'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null)

  const handlePost = (post: Post) => {
    setFeaturedPost(post)
    setActiveTab('home')
  }

  const isCompose = activeTab === 'compose'

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
          {activeTab === 'home' && <FeedScreen featuredPost={featuredPost} />}
          {activeTab === 'compose' && (
            <ComposeScreen
              onBack={() => setActiveTab('home')}
              onPost={handlePost}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* FAB — ホーム画面では「つくる(+)」、つくる画面では「ホームへ(家)」 */}
      <div
        className="absolute z-30"
        style={{ bottom: '36px', left: '50%', transform: 'translateX(-50%)' }}
      >
        <AnimatePresence mode="wait">
          <motion.button
            key={isCompose ? 'fab-home' : 'fab-compose'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={() => setActiveTab(isCompose ? 'home' : 'compose')}
            className="bg-gray-900 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.28)] active:scale-95 transition-transform flex items-center justify-center"
            style={{ width: '56px', height: '56px' }}
            aria-label={isCompose ? 'ホームへ戻る' : '詠む'}
          >
            {isCompose ? (
              <Home size={24} strokeWidth={2} />
            ) : (
              <Plus size={26} strokeWidth={2.5} />
            )}
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  )
}
