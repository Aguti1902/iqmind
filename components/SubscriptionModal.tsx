'use client'

import { useState } from 'react'
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  success?: boolean
  error?: string
}

export default function SubscriptionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading = false,
  success = false,
  error
}: SubscriptionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Cancelar Suscripción
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Suscripción Cancelada!
              </h4>
              <p className="text-gray-600 mb-6">
                Tu suscripción premium ha sido cancelada exitosamente. 
                Mantendrás acceso hasta el final de tu período de facturación actual.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition"
              >
                Entendido
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  ¿Estás seguro de que quieres cancelar tu suscripción premium?
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-red-800 mb-2">
                    ⚠️ Al cancelar perderás:
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Acceso a tests ilimitados</li>
                    <li>• Estadísticas detalladas</li>
                    <li>• Seguimiento de progreso</li>
                    <li>• Soporte prioritario</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-1">
                    ℹ️ Información importante:
                  </h4>
                  <p className="text-sm text-blue-700">
                    Mantendrás acceso hasta el final de tu período de facturación actual. 
                    No se realizarán más cobros después de esa fecha.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  Mantener Suscripción
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Cancelando...
                    </>
                  ) : (
                    'Sí, Cancelar'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
