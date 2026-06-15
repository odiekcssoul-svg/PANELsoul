import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { StreamingAccount, Client, Provider, GmailAccount } from '@/types'
import { formatDate } from './utils'

// ---- Accounts ----
export async function exportAccountsExcel(accounts: StreamingAccount[]) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Cuentas Streaming')

  ws.columns = [
    { header: 'Cliente', key: 'client', width: 20 },
    { header: 'Teléfono', key: 'phone', width: 15 },
    { header: 'Servicio', key: 'service', width: 15 },
    { header: 'Correo', key: 'email', width: 25 },
    { header: 'Contraseña', key: 'password', width: 15 },
    { header: 'Estado', key: 'status', width: 12 },
    { header: 'Inicio', key: 'start', width: 12 },
    { header: 'Renovación', key: 'renewal', width: 12 },
    { header: 'Precio', key: 'price', width: 10 },
    { header: 'Observaciones', key: 'obs', width: 25 },
  ]

  // Header style
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a24' } }

  accounts.forEach(a => {
    ws.addRow({
      client: a.client_name || '',
      phone: a.client_phone || '',
      service: a.service_type,
      email: a.email,
      password: a.password,
      status: a.status === 'active' ? 'Activo' : a.status === 'expired' ? 'Vencido' : 'Suspendido',
      start: formatDate(a.start_date),
      renewal: formatDate(a.renewal_date),
      price: a.price,
      obs: a.observations || '',
    })
  })

  const buffer = await wb.xlsx.writeBuffer()
  downloadBlob(buffer, 'cuentas-streaming.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}

export function exportAccountsPDF(accounts: StreamingAccount[]) {
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text('Reporte de Cuentas Streaming', 14, 16)
  doc.setFontSize(10)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 14, 23)

  autoTable(doc, {
    startY: 28,
    head: [['Cliente', 'Servicio', 'Correo', 'Estado', 'Renovación', 'Precio']],
    body: accounts.map(a => [
      a.client_name || '',
      a.service_type,
      a.email,
      a.status === 'active' ? 'Activo' : 'Vencido',
      formatDate(a.renewal_date),
      `$${a.price}`,
    ]),
    headStyles: { fillColor: [26, 26, 36], textColor: [249, 115, 22] },
    alternateRowStyles: { fillColor: [240, 240, 245] },
    styles: { fontSize: 9 },
  })

  doc.save('cuentas-streaming.pdf')
}

// ---- Clients ----
export async function exportClientsExcel(clients: Client[]) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Clientes')

  ws.columns = [
    { header: 'Nombre', key: 'name', width: 25 },
    { header: 'Teléfono', key: 'phone', width: 15 },
    { header: 'Correo', key: 'email', width: 30 },
    { header: 'Fecha Registro', key: 'created', width: 15 },
    { header: 'Observaciones', key: 'obs', width: 30 },
  ]

  ws.getRow(1).font = { bold: true }

  clients.forEach(c => {
    ws.addRow({
      name: c.name,
      phone: c.phone,
      email: c.email,
      created: formatDate(c.created_at),
      obs: c.observations || '',
    })
  })

  const buffer = await wb.xlsx.writeBuffer()
  downloadBlob(buffer, 'clientes.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}

// ---- Providers ----
export async function exportProvidersExcel(providers: Provider[]) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Proveedores')

  ws.columns = [
    { header: 'Proveedor', key: 'name', width: 25 },
    { header: 'Servicio', key: 'service', width: 15 },
    { header: 'Contacto', key: 'contact', width: 15 },
    { header: 'Renovación', key: 'renewal', width: 15 },
    { header: 'Precio', key: 'price', width: 12 },
    { header: 'Estado', key: 'status', width: 12 },
  ]

  ws.getRow(1).font = { bold: true }

  providers.forEach(p => {
    ws.addRow({
      name: p.name,
      service: p.service,
      contact: p.contact,
      renewal: formatDate(p.renewal_date),
      price: p.price,
      status: p.status === 'active' ? 'Activo' : 'Inactivo',
    })
  })

  const buffer = await wb.xlsx.writeBuffer()
  downloadBlob(buffer, 'proveedores.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}

function downloadBlob(data: ExcelJS.Buffer, filename: string, mime: string) {
  const blob = new Blob([data as BlobPart], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
