import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database-postgres'
import { verifyToken } from '@/lib/auth'

// POST - Hacer deploy manual en Vercel
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación mediante token en cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const userData = verifyToken(token)
    
    if (!userData) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Verificar si es administrador
    const isAdmin = await db.isAdmin(userData.email)
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const vercelToken = process.env.VERCEL_TOKEN
    
    if (!vercelToken) {
      return NextResponse.json({ 
        error: 'VERCEL_TOKEN no configurado',
        message: 'Añade VERCEL_TOKEN en las variables de entorno de Vercel para habilitar deploys automáticos',
        manual_deploy: 'Ve a Vercel Dashboard → tu proyecto → Deployments → Redeploy'
      }, { status: 400 })
    }

    console.log('🚀 Iniciando deploy manual...')

    // Usar Vercel Deploy Hook (más simple y confiable)
    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK
    
    if (deployHookUrl) {
      console.log('📡 Usando Deploy Hook...')
      const response = await fetch(deployHookUrl, { method: 'POST' })
      
      if (response.ok) {
        return NextResponse.json({ 
          success: true,
          message: '✅ Deploy iniciado exitosamente',
          note: 'El deploy estará listo en ~2 minutos. Verifica en Vercel → Deployments'
        }, { status: 200 })
      }
    }

    // Fallback: usar API de Vercel directamente
    const vercelProjectId = process.env.VERCEL_PROJECT_ID
    
    if (!vercelProjectId) {
      return NextResponse.json({ 
        error: 'Variables no configuradas',
        message: 'Configura VERCEL_DEPLOY_HOOK o VERCEL_PROJECT_ID',
        help: {
          deploy_hook: 'Ve a Vercel → Settings → Git → Deploy Hooks → Create Hook',
          project_id: 'Ve a Vercel → Settings → General → Project ID'
        }
      }, { status: 400 })
    }

    console.log('📡 Usando API de Vercel...')
    
    const deployResponse = await fetch(
      'https://api.vercel.com/v13/deployments',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: vercelProjectId,
          gitSource: {
            type: 'github',
            ref: 'main',
            repoId: process.env.GITHUB_REPO_ID || undefined
          },
          target: 'production'
        })
      }
    )

    if (deployResponse.ok) {
      const deployData = await deployResponse.json()
      console.log('✅ Deploy iniciado:', deployData.id)
      
      return NextResponse.json({ 
        success: true,
        message: '✅ Deploy iniciado exitosamente',
        deploymentId: deployData.id,
        deploymentUrl: deployData.url,
        note: 'El deploy estará listo en ~2 minutos'
      }, { status: 200 })
    } else {
      const errorText = await deployResponse.text()
      console.error('Error en deploy:', deployResponse.status, errorText)
      
      return NextResponse.json({ 
        error: 'Error iniciando deploy',
        status: deployResponse.status,
        details: errorText,
        fallback: 'Ve a Vercel Dashboard y haz click en "Redeploy" manualmente'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error en deploy:', error)
    return NextResponse.json({ 
      error: 'Error iniciando deploy',
      details: error.message,
      fallback: 'Ve a Vercel Dashboard → Deployments → Redeploy'
    }, { status: 500 })
  }
}

