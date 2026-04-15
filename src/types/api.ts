export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export interface PaginationQuery {
  page: number
  pageSize: number
}

export interface PaginatedData<T> extends PaginationQuery {
  list: T[]
  total: number
}
