import type { AxiosResponse } from 'axios'
import { z } from 'zod'
import { ApiError } from './axios'

/** Backend success envelope: `{ success: true, message, data }` */
export function successEnvelope<T extends z.ZodType>(data: T) {
  return z.object({
    success: z.literal(true),
    message: z.string().optional(),
    data,
  })
}

/** Validates a response body against a schema; throws INVALID_RESPONSE when the contract is broken. */
export function parseResponse<T extends z.ZodType>(schema: T, response: AxiosResponse<unknown>): z.output<T> {
  const result = schema.safeParse(response.data)
  if (!result.success) {
    if (import.meta.env.DEV) {
      console.error('[api] Response failed validation:', response.config.url, result.error.issues)
    }
    throw new ApiError({
      status: response.status,
      code: 'INVALID_RESPONSE',
      message: 'The server sent an unexpected response.',
      details: result.error.issues.map((issue) => ({
        location: 'response',
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }
  return result.data
}

/** Validates request input before it is sent; throws VALIDATION_ERROR with the first issue as message. */
export function validateInput<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input)
  if (!result.success) {
    throw new ApiError({
      code: 'VALIDATION_ERROR',
      message: result.error.issues[0]?.message ?? 'Invalid input',
      details: result.error.issues.map((issue) => ({
        location: 'client',
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }
  return result.data
}
