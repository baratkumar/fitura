type WhatsAppTextPayload = {
  to: string
  body: string
  previewUrl?: boolean
}

type WhatsAppApiResponse = {
  messaging_product?: string
  contacts?: Array<{ input: string; wa_id: string }>
  messages?: Array<{ id: string }>
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
    fbtrace_id?: string
  }
}

const REQUIRED_ENV_VARS = ['WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_ACCESS_TOKEN'] as const

export function getMissingWhatsAppEnvVars(): string[] {
  return REQUIRED_ENV_VARS.filter((key) => !process.env[key])
}

export function isWhatsAppConfigured(): boolean {
  return getMissingWhatsAppEnvVars().length === 0
}

function normalizePhoneNumber(to: string): string {
  return to.trim().replace(/[^\d]/g, '')
}

function validatePhoneNumber(to: string): string {
  const normalized = normalizePhoneNumber(to)

  if (!/^\d{7,15}$/.test(normalized)) {
    throw new Error('Invalid phone number. Use E.164 format with country code (example: 919876543210).')
  }

  return normalized
}

export async function sendWhatsAppTextMessage(payload: WhatsAppTextPayload) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    const missingEnvVars = getMissingWhatsAppEnvVars().join(', ')
    throw new Error(`WhatsApp is not configured. Missing environment variables: ${missingEnvVars}`)
  }

  const to = validatePhoneNumber(payload.to)
  const body = payload.body?.trim()

  if (!body) {
    throw new Error('Message body is required')
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        body,
        preview_url: payload.previewUrl ?? false,
      },
    }),
  })

  const data = (await response.json()) as WhatsAppApiResponse

  if (!response.ok || data.error) {
    const errorMessage = data.error?.message || `WhatsApp API request failed with status ${response.status}`
    throw new Error(errorMessage)
  }

  return data
}
