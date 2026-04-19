// Lit les infos stockées dans le token JWT (sans librairie externe)

export function getTokenData() {
  const token = localStorage.getItem('token')
  if (!token) return null

  // Le token JWT est en 3 parties séparées par "."
  // La 2ème partie contient les données (payload)
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload))
}

export function getRole() {
  const data = getTokenData()
  return data?.userRole || null
}
