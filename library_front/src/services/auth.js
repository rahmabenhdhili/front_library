const BASE = 'http://localhost:3000/auth'

// Inscription
export async function signup(data) {
  const res = await fetch(`${BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  return res.json()
}

// Connexion (ONLY API CALL)
export async function signin(data) {
  const res = await fetch(`${BASE}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  return res.json() // ❌ no localStorage here
}

// Déconnexion (OPTIONAL: can even remove this)
export function signout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
}
