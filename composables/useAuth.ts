export const useAuth = () => {
    const client = useSupabaseClient()
    const user = useSupabaseUser()
  
    const login = async (email: string, password: string) => {
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    }
  
    const register = async (email: string, password: string) => {
      const { data, error } = await client.auth.signUp({ email, password })
      if (error) throw error
      return data.user  // return the user object
    }
  
    const logout = async () => {
      await client.auth.signOut()
    }
  
    return { user, login, register, logout }
  }
  