// frontend/lib/pdfInvoice.ts
// 📄 PDF INVOICE GENERATOR - Download order receipt

import { jsPDF } from 'jspdf'

export interface InvoiceData {
	orderNumber: string
	orderDate: string
	customerName: string
	customerEmail?: string
	customerPhone: string
	deliveryAddress: string
	items: Array<{
		name: string
		quantity: number
		size?: string
		price: number
	}>
	subtotal: number
	discount?: number
	total: number
	paymentMethod: string
	status: string
}

/**
 * Generate PDF invoice for order
 */
export const generateInvoice = async (data: InvoiceData): Promise<void> => {
	const doc = new jsPDF()

	// Company Header
	doc.setFontSize(24)
	doc.setTextColor(249, 115, 22) // Orange
	doc.text('🍕 Zor Pizza', 105, 20, { align: 'center' })

	doc.setFontSize(10)
	doc.setTextColor(100, 100, 100)
	doc.text('Eng mazali pitsalar', 105, 28, { align: 'center' })
	doc.text('+998 90 123 45 67', 105, 33, { align: 'center' })

	// Invoice Title
	doc.setFontSize(16)
	doc.setTextColor(0, 0, 0)
	doc.text('BUYURTMA CHEKI', 105, 45, { align: 'center' })

	// Order Info
	doc.setFontSize(10)
	doc.text(`Buyurtma raqami: ${data.orderNumber}`, 20, 60)
	doc.text(`Sana: ${new Date(data.orderDate).toLocaleDateString('uz-UZ')}`, 20, 67)
	doc.text(`Holati: ${data.status}`, 20, 74)

	// Customer Info
	doc.text(`Mijoz: ${data.customerName}`, 20, 85)
	if (data.customerEmail) {
		doc.text(`Email: ${data.customerEmail}`, 20, 92)
	}
	doc.text(`Telefon: ${data.customerPhone}`, 20, 99)
	doc.text(`Manzil: ${data.deliveryAddress}`, 20, 106)

	// Items Table Header
	let yPos = 120
	doc.setFillColor(249, 115, 22)
	doc.rect(20, yPos, 170, 8, 'F')
	doc.setTextColor(255, 255, 255)
	doc.text('Mahsulot', 25, yPos + 5)
	doc.text('Miqdor', 120, yPos + 5)
	doc.text('Narx', 160, yPos + 5)

	// Items
	yPos += 12
	doc.setTextColor(0, 0, 0)
	data.items.forEach(item => {
		const name = item.size ? `${item.name} (${item.size})` : item.name
		doc.text(name, 25, yPos)
		doc.text(String(item.quantity), 120, yPos)
		doc.text(`${item.price.toLocaleString()} UZS`, 160, yPos)
		yPos += 7
	})

	// Totals
	yPos += 5
	doc.line(20, yPos, 190, yPos)
	yPos += 8

	doc.text('Mahsulotlar jami:', 120, yPos)
	doc.text(`${data.subtotal.toLocaleString()} UZS`, 160, yPos)
	yPos += 7

	if (data.discount && data.discount > 0) {
		doc.text('Chegirma:', 120, yPos)
		doc.text(`-${data.discount.toLocaleString()} UZS`, 160, yPos)
		yPos += 7
	}

	doc.setFontSize(12)
	doc.setFont('helvetica', 'bold')
	doc.text('JAMI:', 120, yPos)
	doc.text(`${data.total.toLocaleString()} UZS`, 160, yPos)

	// Payment Method
	yPos += 10
	doc.setFontSize(10)
	doc.setFont('helvetica', 'normal')
	doc.text(`To'lov usuli: ${data.paymentMethod === 'CASH' ? 'Naqd' : 'Karta'}`, 20, yPos)

	// Footer
	yPos = 270
	doc.setFontSize(8)
	doc.setTextColor(150, 150, 150)
	doc.text('Buyurtma uchun rahmat! Yana buyurtma bering!', 105, yPos, { align: 'center' })
	doc.text('© 2026 Zor Pizza. Barcha huquqlar himoyalangan.', 105, yPos + 5, { align: 'center' })

	// Save PDF
	doc.save(`zor-pizza-${data.orderNumber}.pdf`)

	console.log('✅ [PDF] Invoice generated:', data.orderNumber)
}
