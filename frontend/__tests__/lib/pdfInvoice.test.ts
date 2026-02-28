// frontend/__tests__/lib/pdfInvoice.test.ts
// 📄 PDF INVOICE TESTS

const mockSave = jest.fn()
const mockText = jest.fn()
const mockSetFontSize = jest.fn()
const mockSetTextColor = jest.fn()
const mockSetFont = jest.fn()
const mockRect = jest.fn()
const mockLine = jest.fn()

jest.mock('jspdf', () => {
	const MockJsPDF = function (this: unknown) {
		this.setFontSize = mockSetFontSize
		this.setTextColor = mockSetTextColor
		this.setFont = mockSetFont
		this.setFillColor = jest.fn()
		this.text = mockText
		this.rect = mockRect
		this.line = mockLine
		this.save = mockSave
		return this
	}
	return {
		__esModule: true,
		jsPDF: MockJsPDF,
		default: MockJsPDF,
	}
})

import { generateInvoice, type InvoiceData } from '@/lib/pdfInvoice'

describe('pdfInvoice', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.spyOn(console, 'log').mockImplementation()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	const sampleInvoiceData: InvoiceData = {
		orderNumber: '#0001',
		orderDate: new Date().toISOString(),
		customerName: 'Test User',
		customerEmail: 'test@example.com',
		customerPhone: '+998901234567',
		deliveryAddress: 'Toshkent, Chilonzor 9',
		items: [
			{ name: 'Pepperoni Pizza', quantity: 1, size: 'Medium', price: 50000 },
			{ name: 'Cola', quantity: 2, price: 10000 },
		],
		subtotal: 70000,
		total: 70000,
		paymentMethod: 'CASH',
		status: 'PENDING',
	}

	it('should generate PDF and call save', async () => {
		await generateInvoice(sampleInvoiceData)

		expect(mockSave).toHaveBeenCalledWith('zor-pizza-#0001.pdf')
		expect(mockText).toHaveBeenCalled()
		expect(mockSetFontSize).toHaveBeenCalled()
	})

	it('should include order number and customer info', async () => {
		await generateInvoice(sampleInvoiceData)

		const textCalls = mockText.mock.calls.map(c => c[0])
		expect(textCalls.some(t => String(t).includes('Buyurtma raqami: #0001'))).toBe(true)
		expect(textCalls.some(t => String(t).includes('Mijoz: Test User'))).toBe(true)
		expect(textCalls.some(t => String(t).includes('Email: test@example.com'))).toBe(true)
	})

	it('should include items with size when provided', async () => {
		await generateInvoice(sampleInvoiceData)

		const textCalls = mockText.mock.calls.map(c => c[0])
		expect(textCalls.some(t => typeof t === 'string' && t.includes('Pepperoni Pizza') && t.includes('Medium'))).toBe(true)
	})

	it('should include total amount', async () => {
		await generateInvoice(sampleInvoiceData)

		const textCalls = mockText.mock.calls.map(c => String(c[0]))
		expect(textCalls.some(t => t.includes('70') && t.includes('UZS'))).toBe(true)
	})

	it('should work without customerEmail', async () => {
		const dataWithoutEmail = { ...sampleInvoiceData, customerEmail: undefined }
		await generateInvoice(dataWithoutEmail)

		expect(mockSave).toHaveBeenCalled()
		const emailCalls = mockText.mock.calls.filter(c => String(c[0]).startsWith('Email:'))
		expect(emailCalls.length).toBe(0)
	})

	it('should include discount when provided', async () => {
		const dataWithDiscount = {
			...sampleInvoiceData,
			subtotal: 70000,
			discount: 10000,
			total: 60000,
		}
		await generateInvoice(dataWithDiscount)

		const textCalls = mockText.mock.calls.map(c => String(c[0]))
		expect(textCalls.some(t => t.includes('Chegirma'))).toBe(true)
	})
})
