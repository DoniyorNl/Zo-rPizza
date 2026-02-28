// backend/src/services/email.service.ts
// 📧 EMAIL SERVICE - Resend.com integration

import { Resend } from 'resend'

// ============================================================================
// RESEND CLIENT INITIALIZATION
// ============================================================================
const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
	console.warn('⚠️  RESEND_API_KEY not found. Email notifications will be logged only.')
}

const resend = resendApiKey ? new Resend(resendApiKey) : null

// ============================================================================
// EMAIL CONFIG
// ============================================================================
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const APP_URL = process.env.FRONTEND_URLS?.split(',')[0] || 'http://localhost:3000'

// Log email configuration on startup
if (resend) {
	console.log('📧 Email service configured')
	console.log('   From:', FROM_EMAIL)
} else {
	console.log('⚠️  Email service not configured (simulation mode)')
}

// ============================================================================
// EMAIL TYPES
// ============================================================================

export interface OrderEmailData {
	customerName: string
	customerEmail: string
	orderNumber: string
	orderId: string
	items: Array<{
		name: string
		quantity: number
		size?: string
		price: number
	}>
	totalPrice: number
	deliveryAddress: string
	paymentMethod: string
	estimatedDelivery?: string
}

export interface OrderStatusUpdateData {
	customerName: string
	customerEmail: string
	orderNumber: string
	orderId: string
	status: string
	statusText: string
	message: string
}

// ============================================================================
// EMAIL TEMPLATES (HTML)
// ============================================================================

/**
 * Order Confirmation Email Template
 */
const getOrderConfirmationHTML = (data: OrderEmailData): string => {
	const itemsHTML = data.items
		.map(
			item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${item.name} ${item.size ? `(${item.size})` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${item.price.toLocaleString('uz-UZ')} UZS
      </td>
    </tr>
  `,
		)
		.join('')

	return `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Buyurtma Tasdiqlandi</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🍕 Zor Pizza</h1>
              <p style="margin: 10px 0 0 0; color: #fff3cd; font-size: 16px;">Buyurtmangiz qabul qilindi!</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                Assalomu alaykum, <strong>${data.customerName}</strong>!
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Buyurtmangiz muvaffaqiyatli qabul qilindi va tayyorlanmoqda. Tez orada sizga yetkazib beramiz!
              </p>

              <!-- Order Details Box -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Buyurtma ma'lumotlari</h2>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Buyurtma raqami:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600; text-align: right;">
                      ${data.orderNumber}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Yetkazib berish manzili:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">
                      ${data.deliveryAddress}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">To'lov usuli:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">
                      ${data.paymentMethod === 'CASH' ? 'Naqd pul' : data.paymentMethod === 'CARD' ? 'Karta' : data.paymentMethod}
                    </td>
                  </tr>
                  ${
										data.estimatedDelivery
											? `
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Taxminiy yetkazib berish:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">
                      ${data.estimatedDelivery}
                    </td>
                  </tr>
                  `
											: ''
									}
                </table>
              </div>

              <!-- Order Items Table -->
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Buyurtma tarkibi</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #374151;">Mahsulot</th>
                    <th style="padding: 12px; text-align: center; font-size: 14px; font-weight: 600; color: #374151;">Miqdor</th>
                    <th style="padding: 12px; text-align: right; font-size: 14px; font-weight: 600; color: #374151;">Narx</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>

              <!-- Total -->
              <div style="text-align: right; padding: 20px; background-color: #fef3c7; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 18px; color: #78350f;">
                  <strong>Jami:</strong> <span style="font-size: 24px; font-weight: bold; color: #f97316;">${data.totalPrice.toLocaleString('uz-UZ')} UZS</span>
                </p>
              </div>

              <!-- Track Order Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/tracking/${data.orderId}" 
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                  🗺️ Buyurtmani kuzatish
                </a>
              </div>

              <!-- Contact Info -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                  Savollaringiz bo'lsa, biz bilan bog'laning:
                </p>
                <p style="margin: 0; font-size: 14px; color: #374151;">
                  📞 <a href="tel:+998901234567" style="color: #f97316; text-decoration: none; font-weight: 600;">+998 90 123 45 67</a>
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                © 2026 Zor Pizza. Barcha huquqlar himoyalangan.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Bu avtomatik xabar. Iltimos, javob bermang.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * Order Status Update Email Template
 */
const getOrderStatusUpdateHTML = (data: OrderStatusUpdateData): string => {
	const statusColors: Record<string, string> = {
		CONFIRMED: '#10b981',
		PREPARING: '#f59e0b',
		OUT_FOR_DELIVERY: '#3b82f6',
		DELIVERED: '#22c55e',
		CANCELLED: '#ef4444',
	}

	const statusEmojis: Record<string, string> = {
		CONFIRMED: '✅',
		PREPARING: '👨‍🍳',
		OUT_FOR_DELIVERY: '🚗',
		DELIVERED: '🎉',
		CANCELLED: '❌',
	}

	const statusColor = statusColors[data.status] || '#6b7280'
	const statusEmoji = statusEmojis[data.status] || '📦'

	return `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Buyurtma Holati</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🍕 Zor Pizza</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Status Badge -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: ${statusColor}; color: #ffffff; padding: 20px 40px; border-radius: 50px; font-size: 48px;">
                  ${statusEmoji}
                </div>
                <h2 style="margin: 20px 0 10px 0; font-size: 24px; color: #111827; font-weight: bold;">
                  ${data.statusText}
                </h2>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  Buyurtma ${data.orderNumber}
                </p>
              </div>

              <!-- Message -->
              <div style="background-color: #f9fafb; border-left: 4px solid ${statusColor}; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
                  ${data.message}
                </p>
              </div>

              <!-- Track Order Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}/tracking/${data.orderId}" 
                   style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                  🗺️ Buyurtmani kuzatish
                </a>
              </div>

              <!-- Contact Info -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                  Savollaringiz bo'lsa, biz bilan bog'laning:
                </p>
                <p style="margin: 0; font-size: 14px; color: #374151;">
                  📞 <a href="tel:+998901234567" style="color: #f97316; text-decoration: none; font-weight: 600;">+998 90 123 45 67</a>
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                © 2026 Zor Pizza. Barcha huquqlar himoyalangan.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Bu avtomatik xabar. Iltimos, javob bermang.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// ============================================================================
// EMAIL SENDING FUNCTIONS
// ============================================================================

/**
 * Send Order Confirmation Email
 */
export const sendOrderConfirmationEmail = async (data: OrderEmailData): Promise<boolean> => {
	try {
		// Validate email address
		if (!data.customerEmail || !data.customerEmail.includes('@')) {
			console.error('❌ [EMAIL] Invalid email address:', data.customerEmail)
			console.log('📧 [EMAIL SIMULATION] Order confirmation (invalid email)')
			console.log('   Order Number:', data.orderNumber)
			console.log('   Total:', data.totalPrice, 'UZS')
			return false
		}

		if (!resend) {
			console.log('📧 [EMAIL SIMULATION] Order confirmation email to:', data.customerEmail)
			console.log('   Order Number:', data.orderNumber)
			console.log('   Total:', data.totalPrice, 'UZS')
			return true
		}

		// Ensure email is properly formatted (trim whitespace)
		const cleanEmail = data.customerEmail.trim().toLowerCase()

		console.log(`📧 [EMAIL] Sending order confirmation to: ${cleanEmail}`)

		const { data: emailResponse, error } = await resend.emails.send({
			from: FROM_EMAIL,
			to: cleanEmail,
			subject: `✅ Buyurtma tasdiqlandi - ${data.orderNumber}`,
			html: getOrderConfirmationHTML(data),
		})

		if (error) {
			console.error('❌ [EMAIL ERROR] Failed to send order confirmation:', error)
			console.error('   Email:', cleanEmail)
			console.error('   Error details:', JSON.stringify(error, null, 2))
			return false
		}

		console.log('✅ [EMAIL SENT] Order confirmation sent:', emailResponse?.id)
		console.log('   To:', cleanEmail)
		return true
	} catch (error) {
		console.error('❌ [EMAIL ERROR] Exception while sending order confirmation:', error)
		return false
	}
}

/**
 * Send Order Status Update Email
 */
export const sendOrderStatusUpdateEmail = async (data: OrderStatusUpdateData): Promise<boolean> => {
	try {
		// Validate email address
		if (!data.customerEmail || !data.customerEmail.includes('@')) {
			console.error('❌ [EMAIL] Invalid email address:', data.customerEmail)
			return false
		}

		if (!resend) {
			console.log('📧 [EMAIL SIMULATION] Order status update to:', data.customerEmail)
			console.log('   Order Number:', data.orderNumber)
			console.log('   New Status:', data.status)
			return true
		}

		// Ensure email is properly formatted
		const cleanEmail = data.customerEmail.trim().toLowerCase()

		console.log(`📧 [EMAIL] Sending status update to: ${cleanEmail}`)

		const { data: emailResponse, error } = await resend.emails.send({
			from: FROM_EMAIL,
			to: cleanEmail,
			subject: `${data.statusText} - ${data.orderNumber}`,
			html: getOrderStatusUpdateHTML(data),
		})

		if (error) {
			console.error('❌ [EMAIL ERROR] Failed to send status update:', error)
			console.error('   Email:', cleanEmail)
			console.error('   Error details:', JSON.stringify(error, null, 2))
			return false
		}

		console.log('✅ [EMAIL SENT] Status update sent:', emailResponse?.id)
		console.log('   To:', cleanEmail)
		return true
	} catch (error) {
		console.error('❌ [EMAIL ERROR] Exception while sending status update:', error)
		return false
	}
}

// ============================================================================
// HELPER: Get Status Text in Uzbek
// ============================================================================
export const getStatusText = (status: string): string => {
	const statusMap: Record<string, string> = {
		PENDING: 'Kutilmoqda',
		CONFIRMED: 'Tasdiqlandi',
		PREPARING: 'Tayyorlanmoqda',
		OUT_FOR_DELIVERY: "Yo'lda",
		DELIVERED: 'Yetkazildi',
		CANCELLED: 'Bekor qilindi',
	}
	return statusMap[status] || status
}

export const getStatusMessage = (status: string): string => {
	const messageMap: Record<string, string> = {
		CONFIRMED:
			"Buyurtmangiz tasdiqlandi! Oshxonamiz sizning pizza'ngizni tayyorlashni boshladi.",
		PREPARING: "Buyurtmangiz tayyorlanmoqda. Tez orada haydovchimiz yo'lga chiqadi.",
		OUT_FOR_DELIVERY: "Buyurtmangiz yo'lda! Haydovchimiz sizga yetkazib bermoqda.",
		DELIVERED:
			"Buyurtmangiz yetkazildi! Ishtahangiz ochsin! Bizni tanlaganingiz uchun rahmat.",
		CANCELLED:
			"Buyurtmangiz bekor qilindi. Agar bu xato bo'lsa, iltimos biz bilan bog'laning.",
	}
	return messageMap[status] || 'Buyurtma holati yangilandi.'
}
