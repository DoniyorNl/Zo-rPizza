// =====================================
// 📁 FILE PATH: backend/src/utils/logger.ts
// 📝 LOGGING SERVICE - Winston
// =====================================

import winston from 'winston'
import path from 'path'

// Log levels
const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
}

// Log colors
const colors = {
	error: 'red',
	warn: 'yellow',
	info: 'green',
	http: 'magenta',
	debug: 'white',
}

winston.addColors(colors)

// Format for console
const consoleFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.colorize({ all: true }),
	winston.format.printf(info => {
		const { timestamp, level, message, ...meta } = info
		const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
		return `${timestamp} [${level}]: ${message} ${metaStr}`
	}),
)

// Format for file
const fileFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.errors({ stack: true }),
	winston.format.json(),
)

// Transports
const transports: winston.transport[] = [
	// Console logs
	new winston.transports.Console({
		format: consoleFormat,
	}),
]

// File logs (faqat production'da)
if (process.env.NODE_ENV === 'production') {
	transports.push(
		// All logs
		new winston.transports.File({
			filename: path.join('logs', 'combined.log'),
			format: fileFormat,
		}),
		// Error logs
		new winston.transports.File({
			filename: path.join('logs', 'error.log'),
			level: 'error',
			format: fileFormat,
		}),
	)
}

// Logger instance
export const logger = winston.createLogger({
	level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
	levels,
	transports,
	exitOnError: false,
})

// Stream for Morgan middleware
export const morganStream = {
	write: (message: string) => {
		logger.http(message.trim())
	},
}

// Helper methods
export const logError = (error: Error, meta?: Record<string, any>) => {
	logger.error(error.message, {
		error: {
			name: error.name,
			message: error.message,
			stack: error.stack,
		},
		...meta,
	})
}

export const logInfo = (message: string, meta?: Record<string, any>) => {
	logger.info(message, meta)
}

export const logWarn = (message: string, meta?: Record<string, any>) => {
	logger.warn(message, meta)
}

export const logDebug = (message: string, meta?: Record<string, any>) => {
	logger.debug(message, meta)
}

export default logger
