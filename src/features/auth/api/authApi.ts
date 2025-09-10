import { supabase } from '../../../lib/supabase/client'
import { User } from '@supabase/supabase-js'

/**
 * API Layer for Authentication operations
 * Handles all authentication-related operations
 */
export const authApi = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Sign in failed:', error.message)
        return { user: null, error: error.message }
      }

      console.log('✅ Sign in successful:', data.user?.email)
      return { user: data.user, error: null }
    } catch (error) {
      console.error('❌ Sign in error:', error)
      return { user: null, error: 'حدث خطأ أثناء تسجيل الدخول' }
    }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error('❌ Sign up failed:', error.message)
        return { user: null, error: error.message }
      }

      console.log('✅ Sign up successful:', data.user?.email)
      return { user: data.user, error: null }
    } catch (error) {
      console.error('❌ Sign up error:', error)
      return { user: null, error: 'حدث خطأ أثناء إنشاء الحساب' }
    }
  },

  /**
   * Sign out
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('❌ Sign out failed:', error.message)
        return { error: error.message }
      }

      console.log('✅ Sign out successful')
      return { error: null }
    } catch (error) {
      console.error('❌ Sign out error:', error)
      return { error: 'حدث خطأ أثناء تسجيل الخروج' }
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        console.error('❌ Get user failed:', error.message)
        return { user: null, error: error.message }
      }

      return { user, error: null }
    } catch (error) {
      console.error('❌ Get user error:', error)
      return { user: null, error: 'حدث خطأ أثناء جلب بيانات المستخدم' }
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const { user } = await authApi.getCurrentUser()
    return !!user
  }
}

/**
 * Ensure user is authenticated
 * Used by storage operations and other authenticated features
 */
export const ensureAuthenticated = async (): Promise<{ isAuthenticated: boolean; error?: string }> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.warn('🔐 Authentication required:', error?.message || 'No active session')
      return {
        isAuthenticated: false,
        error: error?.message || 'يجب تسجيل الدخول أولاً'
      }
    }

    console.log('✅ User authenticated:', user.email)
    return { isAuthenticated: true }
  } catch (error) {
    console.error('❌ Authentication check failed:', error)
    return {
      isAuthenticated: false,
      error: 'حدث خطأ في التحقق من المصادقة'
    }
  }
}
