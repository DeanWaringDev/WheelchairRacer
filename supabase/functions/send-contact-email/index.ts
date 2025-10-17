// Supabase Edge Function to send contact form emails
// Deploy this to Supabase: supabase functions deploy send-contact-email
// @ts-ignore - Deno runtime, not Node.js
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// @ts-ignore - Deno global
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  category: string
}

// @ts-ignore - Deno serve function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData: ContactFormData = await req.json()

    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Send email using Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Wheelchair Racer <noreply@wheelchairracer.com>',
        to: ['contact@wheelchairracer.com'],
        reply_to: formData.email,
        subject: `[${formData.category.toUpperCase()}] ${formData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #2563eb, #9333ea); padding: 20px; color: white;">
              <h1 style="margin: 0;">New Contact Form Submission</h1>
            </div>
            
            <div style="padding: 20px; background: #f9fafb;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #1f2937; margin-top: 0;">Contact Details</h2>
                <p><strong>Name:</strong> ${formData.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
                <p><strong>Category:</strong> ${formData.category}</p>
                <p><strong>Subject:</strong> ${formData.subject}</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h2 style="color: #1f2937; margin-top: 0;">Message</h2>
                <p style="white-space: pre-wrap; line-height: 1.6;">${formData.message}</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px; border-left: 4px solid #2563eb;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <strong>💡 Quick Reply:</strong> Click the email address above to reply directly to ${formData.name}
                </p>
              </div>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>This message was sent via the Wheelchair Racer contact form</p>
              <p>Sent on ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} GMT</p>
            </div>
          </div>
        `,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return new Response(JSON.stringify({ success: true, id: data.id }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      const error = await res.text()
      console.error('Resend API Error:', error)
      return new Response(JSON.stringify({ error: 'Failed to send email', details: error }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Edge Function Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    return new Response(JSON.stringify({ error: errorMessage, stack: errorStack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
