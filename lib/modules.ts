import { prisma } from '@/lib/db'

/**
 * Verifica si un Tenant específico tiene un módulo activo.
 * @param tenantId ID del comercio
 * @param moduleCode Código del módulo (Ej: 'POS_CAJA', 'ECOM')
 */
export async function isModuleActive(tenantId: string, moduleCode: string): Promise<boolean> {
  try {
    const relation = await prisma.tenantModule.findFirst({
      where: {
        tenantId: tenantId,
        isActive: true,
        module: {
          code: moduleCode,
        },
      },
    });

    return !!relation; // Retorna true si encontró la relación activa, false si no.
  } catch (error) {
    console.error("Error verificando módulo:", error);
    return false;
  }
}