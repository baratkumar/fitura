import { NextRequest, NextResponse } from 'next/server'
import {
  getMissingWhatsAppEnvVars,
  isWhatsAppConfigured,
  sendWhatsAppTextMessage,
} from '@/lib/whatsapp'

type SendMessageBody = {
  to?: string
  message?: string
  previewUrl?: boolean
}

export async function POST(request: NextRequest) {
  try {
    if (!isWhatsAppConfigured()) {
      return NextResponse.json(
        {
          error: 'WhatsApp API is not configured',
          missingEnvVars: getMissingWhatsAppEnvVars(),
        },
        { status: 500 }
      )
    }

    const body = (await request.json()) as SendMessageBody
    const to = body.to?.trim()
    const message = body.message?.trim()

    if (!to || !message) {
      return NextResponse.json(
        { error: '`to` and `message` are required' },
        { status: 400 }
      )
    }

    const result = await sendWhatsAppTextMessage({
      to,
      body: message,
      previewUrl: body.previewUrl,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'WhatsApp message sent',
        result,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send WhatsApp message',
      },
      { status: 500 }
    )
  }
}
