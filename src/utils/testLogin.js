import { supabase } from '../lib/supabase'

export async function testLogin(email, password) {
  try {
    console.log('Testing login with:', { email })
    
    // 1. Zkusíme přihlášení
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    console.log('Auth response:', { authData, authError })

    if (authError) throw authError

    // 2. Zkusíme načíst profil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    console.log('Profile response:', { profileData, profileError })

    if (profileError) throw profileError

    return {
      success: true,
      user: authData.user,
      profile: profileData
    }

  } catch (error) {
    console.error('Login test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
