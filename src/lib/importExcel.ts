import * as XLSX from 'xlsx'

export interface ImportResult {
  clients: ImportedClient[]
  accounts: ImportedAccount[]
  gmailAccounts: ImportedGmail[]
  errors: string[]
  summary: {
    clients: number
    accounts: number
    gmail: number
  }
}

export interface ImportedClient {
  name: string
  phone: string
  email: string
}

export interface ImportedAccount {
  client_name: string
  client_phone: string
  email: string
  password: string
  service_type: string
  account_status: string
  status: 'active' | 'expired' | 'suspended'
  start_date: string
  renewal_date: string
  price: number
  counter: number
  observations: string
}

export interface ImportedGmail {
  email: string
  password: string
  status: 'active'
}

// Servicios válidos en la app
const SERVICE_MAP: Record<string, string> = {
  'SPOTIFY': 'Spotify',
  'YOUTUBE': 'YouTube Premium',
  'YOU TUBE': 'YouTube Premium',
  'YOU TOBE': 'YouTube Premium',
  'YOUTOBE': 'YouTube Premium',
  'YOUTUBE PREMIUM': 'YouTube Premium',
  'DISNEY': 'Disney+',
  'DISNEY+': 'Disney+',
  'DISNEY PLUS': 'Disney+',
  'HBO': 'HBO Max',
  'HBO MAX': 'HBO Max',
  'PRIME': 'Prime Video',
  'PRIME VIDEO': 'Prime Video',
  'CRONCHIROLL': 'Crunchyroll',
  'CRUNCHYROLL': 'Crunchyroll',
  'NETFLIX': 'Netflix',
  'VIX': 'Vix Premium',
  'VIX PREMIUM': 'Vix Premium',
  'VIX PREMIUN': 'Vix Premium',
  'PARAMOUNT': 'Paramount+',
  'PARAMOUNT+': 'Paramount+',
  'PÁRAMOUNT': 'Paramount+',
}

// Convertir fecha de Excel (número serial o string) a YYYY-MM-DD
function parseDate(val: any): string {
  if (!val) return ''
  if (typeof val === 'number') {
    const date = XLSX.SSF.parse_date_code(val)
    if (date) {
      const y = date.y
      const m = String(date.m).padStart(2, '0')
      const d = String(date.d).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
  }
  if (typeof val === 'string') {
    // formato DD/MM/YYYY o DD/MM/YY
    const match = val.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
    if (match) {
      const d = match[1].padStart(2, '0')
      const m = match[2].padStart(2, '0')
      let y = match[3]
      if (y.length === 2) y = '20' + y
      return `${y}-${m}-${d}`
    }
  }
  return ''
}

function normalizeStatus(val: any): 'active' | 'expired' | 'suspended' {
  const s = String(val || '').toUpperCase().trim()
  if (s === 'CADUCÓ' || s === 'CADUCO' || s === 'VENCIDO' || s === 'EXPIRED') return 'expired'
  if (s === 'SUSPENDIDO' || s === 'SUSPENDED') return 'suspended'
  return 'active'
}

function cleanPhone(phone: any): string {
  if (!phone) return ''
  return String(phone).replace(/\D/g, '').slice(-10)
}

function cleanPrice(val: any): number {
  if (!val) return 0
  const n = parseFloat(String(val).replace(/[$,\s]/g, ''))
  return isNaN(n) ? 0 : n
}

// Detectar qué hoja corresponde a qué servicio por su nombre
function detectService(sheetName: string): string {
  const name = sheetName.toUpperCase().trim()
  for (const [key, val] of Object.entries(SERVICE_MAP)) {
    if (name.includes(key)) return val
  }
  return ''
}

export function parseExcelFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', cellDates: false })

        const result: ImportResult = {
          clients: [],
          accounts: [],
          gmailAccounts: [],
          errors: [],
          summary: { clients: 0, accounts: 0, gmail: 0 },
        }

        const clientMap = new Map<string, ImportedClient>()

        for (const sheetName of workbook.SheetNames) {
          const upper = sheetName.toUpperCase().trim()

          // ── Hoja CLIENTES ──────────────────────────────────────────
          if (upper.includes('CLIENTE')) {
            const sheet = workbook.Sheets[sheetName]
            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

            for (const row of rows) {
              // Buscar filas con ID tipo CL01, CL02...
              const idCell = String(row[0] || '').trim()
              if (!idCell.match(/^CL\d+$/i)) continue

              const name = String(row[1] || '').trim()
              const phone = cleanPhone(row[2])
              if (!name || name === 'NOMBRE') continue

              const key = name.toUpperCase()
              if (!clientMap.has(key)) {
                clientMap.set(key, { name, phone, email: '' })
              }
            }
          }

          // ── Hoja CORREOS GMAIL ─────────────────────────────────────
          if (upper.includes('GMAIL') || upper.includes('CORREO')) {
            const sheet = workbook.Sheets[sheetName]
            const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

            for (const row of rows) {
              const email = String(row[0] || '').trim()
              const password = String(row[1] || '').trim()
              if (!email.includes('@') || email === 'CORREO') continue
              result.gmailAccounts.push({ email, password, status: 'active' })
            }
          }

          // ── Hojas de servicios de streaming ───────────────────────
          const service = detectService(sheetName)
          if (!service) continue

          const sheet = workbook.Sheets[sheetName]
          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

          // Detectar fila de cabecera buscando "CORREO" o "NOMBRE"
          let headerRow = -1
          for (let i = 0; i < Math.min(10, rows.length); i++) {
            const rowStr = rows[i].map((c: any) => String(c).toUpperCase()).join('|')
            if (rowStr.includes('CORREO') && rowStr.includes('NOMBRE')) {
              headerRow = i
              break
            }
          }
          if (headerRow === -1) continue

          const headers = rows[headerRow].map((h: any) => String(h).toUpperCase().trim())

          // Mapear índices de columnas
          const col = {
            id: headers.findIndex(h => h === 'ID'),
            name: headers.findIndex(h => h === 'NOMBRE'),
            email: headers.findIndex(h => h === 'CORREO'),
            password: headers.findIndex(h => h.includes('CONTRACE') || h.includes('CONTRASEÑA') || h.includes('CONTRASE')),
            serviceType: headers.findIndex(h => h.includes('TIPO') || h.includes('SERVICO') || h.includes('SERVICIO')),
            accountStatus: headers.findIndex(h => h.includes('ESTADO DE LA') || h.includes('ESTADO DE')),
            phone: headers.findIndex(h => h.includes('TELEFONO') || h.includes('TELÉFONO')),
            startDate: headers.findIndex(h => h.includes('INICIO')),
            renewalDate: headers.findIndex(h => h.includes('RENOVAC')),
            price: headers.findIndex(h => h.includes('PRECIO') || h.includes('PRECIOO')),
            counter: headers.findIndex(h => h.includes('CONTADOR')),
            status: headers.reduce((last, h, i) => h === 'ESTADO' ? i : last, -1),
          }

          for (let i = headerRow + 1; i < rows.length; i++) {
            const row = rows[i]
            if (!row || row.every((c: any) => !c)) continue

            const email = String(row[col.email] ?? '').trim()
            if (!email || !email.includes('@')) continue

            const clientName = String(row[col.name] ?? '').trim()
            const phone = cleanPhone(row[col.phone])
            const password = String(row[col.password] ?? '').trim()
            const accountStatusRaw = String(row[col.accountStatus] ?? '').trim()
            const statusRaw = col.status >= 0 ? String(row[col.status] ?? '').trim() : ''
            const startDate = parseDate(row[col.startDate])
            const renewalDate = parseDate(row[col.renewalDate])
            const price = cleanPrice(row[col.price])
            const counter = parseInt(String(row[col.counter] ?? '1')) || 1
            const serviceTypeRaw = col.serviceType >= 0 ? String(row[col.serviceType] ?? '').trim() : ''

            // Registrar cliente si tiene nombre y teléfono
            if (clientName && !clientMap.has(clientName.toUpperCase())) {
              clientMap.set(clientName.toUpperCase(), { name: clientName, phone, email: '' })
            }

            // Determinar estado real de la cuenta
            const combinedStatus = (accountStatusRaw + ' ' + statusRaw).toUpperCase()
            let status: 'active' | 'expired' | 'suspended' = 'active'
            if (combinedStatus.includes('CADUCÓ') || combinedStatus.includes('CADUCO') || combinedStatus.includes('VENCIDO')) {
              status = 'expired'
            } else if (combinedStatus.includes('DISPONIBLE')) {
              // Cuentas disponibles: sin cliente asignado, activas
              status = 'active'
            }

            result.accounts.push({
              client_name: clientName || '',
              client_phone: phone,
              email,
              password,
              service_type: service,
              account_status: serviceTypeRaw,
              status,
              start_date: startDate,
              renewal_date: renewalDate,
              price,
              counter,
              observations: '',
            })
          }
        }

        result.clients = Array.from(clientMap.values())
        result.summary = {
          clients: result.clients.length,
          accounts: result.accounts.length,
          gmail: result.gmailAccounts.length,
        }

        resolve(result)
      } catch (err: any) {
        resolve({
          clients: [],
          accounts: [],
          gmailAccounts: [],
          errors: ['Error al leer el archivo: ' + err.message],
          summary: { clients: 0, accounts: 0, gmail: 0 },
        })
      }
    }
    reader.readAsArrayBuffer(file)
  })
}
