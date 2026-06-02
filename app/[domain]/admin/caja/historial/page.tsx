'use client'

import React, { useEffect, useState } from 'react'
import { Calendar, User, ArrowLeft, Eye, ShieldAlert, CheckCircle2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function CashHistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<any>(null)

  // Cargar historial desde el nuevo endpoint
  async function loadHistory() {
    try {
      const res = await fetch('/api/admin/pos/history')
      const data = await res.json()
      if (res.ok) {
        setHistory(data.history || [])
      } else {
        throw new Error(data.error || 'Error al cargar historial')
      }
    } catch (err: any) {
      toast.error(err.message || 'No se pudo cargar el historial de cajas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  // Formateador de moneda local
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* CABECERA */}
      <div className="flex items-center gap-4">
        <Link href="/admin/caja">
          <Button variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-950 dark:text-white">Auditoría e Historial de Cajas</h1>
          <p className="text-xs text-slate-500">Revisa los cierres de turno, movimientos manuales y descuadres de dinero.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Cargando historial de turnos...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-2xl text-slate-500 text-sm">
          No se han registrado aperturas de caja en este local comercial aún.
        </div>
      ) : (
        /* TABLA DE HISTORIAL */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-4 text-xs uppercase tracking-wider">Apertura</th>
                  <th className="p-4 text-xs uppercase tracking-wider">Operador</th>
                  <th className="p-4 text-xs uppercase tracking-wider">Base Inicial</th>
                  <th className="p-4 text-xs uppercase tracking-wider">Esperado</th>
                  <th className="p-4 text-xs uppercase tracking-wider">Entregado</th>
                  <th className="p-4 text-xs uppercase tracking-wider">Diferencia</th>
                  <th className="p-4 text-xs uppercase tracking-wider">Estado</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-900 dark:text-slate-100">
                {history.map((item) => {
                  const diff = item.difference ?? 0
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-xs">
                          {new Date(item.openedAt || item.createdAt).toLocaleDateString('es-CO')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(item.openedAt || item.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium flex items-center gap-1.5 pt-6">
                        <User className="h-3 w-3 text-slate-400" />
                        {item.user?.name || 'Cajero'}
                      </td>
                      <td className="p-4 font-mono text-xs">{formatPrice(item.openingBalance)}</td>
                      <td className="p-4 font-mono text-xs">{formatPrice(item.expectedBalance)}</td>
                      <td className="p-4 font-mono text-xs">{item.actualBalance !== null ? formatPrice(item.actualBalance) : '---'}</td>
                      <td className="p-4 font-mono text-xs">
                        {item.status === 'OPEN' ? (
                          <span className="text-slate-400">En curso...</span>
                        ) : diff === 0 ? (
                          <span className="text-emerald-600 font-bold">Cuadrado</span>
                        ) : diff < 0 ? (
                          <span className="text-rose-600 font-bold">-{formatPrice(Math.abs(diff))}</span>
                        ) : (
                          <span className="text-blue-600 font-bold">+{formatPrice(diff)}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {item.status === 'OPEN' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                            Abierta
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Cerrada
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedSession(item)}
                          className="h-7 text-xs rounded-lg"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          Detalle
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETALLADO DE AUDITORÍA */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-xl dark:bg-slate-950 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Arqueo de Turno #{selectedSession.id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-slate-500">Operado por {selectedSession.user?.name}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSession(null)} className="rounded-lg text-xs">Cerrar</Button>
            </div>

            {/* RESUMEN DE SALDOS */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border">
                <span className="text-[10px] uppercase font-semibold text-slate-500">Base Apertura</span>
                <p className="text-base font-bold font-mono text-slate-900 dark:text-white">{formatPrice(selectedSession.openingBalance)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border">
                <span className="text-[10px] uppercase font-semibold text-slate-500">Monto Calculado</span>
                <p className="text-base font-bold font-mono text-slate-900 dark:text-white">{formatPrice(selectedSession.expectedBalance)}</p>
              </div>
            </div>

            {/* BALANCE FINAL */}
            {selectedSession.status === 'CLOSED' && (
              <div className={`p-4 rounded-xl border mb-4 flex items-center justify-between ${
                selectedSession.difference === 0 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' 
                  : selectedSession.difference < 0 
                    ? 'bg-rose-50/50 border-rose-200 text-rose-800' 
                    : 'bg-blue-50/50 border-blue-200 text-blue-800'
              }`}>
                <div className="space-y-0.5">
                  <span className="text-xs font-medium">Resultado del Arqueo</span>
                  <p className="text-xs font-bold">
                    {selectedSession.difference === 0 
                      ? 'Caja cuadrada perfectamente.' 
                      : selectedSession.difference < 0 
                        ? 'Faltante de dinero detectado en caja.' 
                        : 'Sobrante de dinero acumulado.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase block opacity-70">Diferencia</span>
                  <span className="text-lg font-extrabold font-mono">{formatPrice(selectedSession.difference ?? 0)}</span>
                </div>
              </div>
            )}

            {/* LISTA DE MOVIMIENTOS INTERNOS */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Movimientos del Turno ({selectedSession.movements?.length || 0})</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto border rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/30">
              {selectedSession.movements?.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No hubo transacciones manuales en este turno.</p>
              ) : (
                selectedSession.movements?.map((m: any) => (
                  <div key={m.id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-lg border text-xs shadow-sm">
                    <div className="space-y-0.5">
                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        m.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {m.type === 'INCOME' ? 'INGRESO' : 'GASTO'}
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{m.description}</p>
                    </div>
                    <span className={`font-mono font-bold ${m.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.type === 'INCOME' ? '+' : '-'}{formatPrice(m.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* NOTAS ADICIONALES */}
            <div className="mt-4 space-y-2 border-t pt-3 text-xs">
              {selectedSession.notes && (
                <p className="text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-white">Notas de Apertura:</span> {selectedSession.notes}
                </p>
              )}
              {selectedSession.closingNotes && (
                <p className="text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-white">Observaciones de Cierre:</span> {selectedSession.closingNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}