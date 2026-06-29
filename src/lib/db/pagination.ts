export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface PaginationResult {
  skip: number
  take: number
  page: number
  limit: number
}

export function paginate(
  options: PaginationOptions = {}
): PaginationResult {

  const page = Math.max(1, options.page ?? 1)
  const limit = Math.max(1, options.limit ?? 10)

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  }
}
