'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient} from '@/lib/client'
import { LoginForm } from '@/components/login-form'

export default function Page() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        router.push('/protected')
      }
    }

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/protected')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm  />
      </div>
    </div>
  )
}
