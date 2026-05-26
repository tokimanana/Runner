import { HttpParams } from '@angular/common/http';
import { PaginationParams } from '@runner/shared/types';

export function buildPaginationParams(params?: PaginationParams): HttpParams {
  let httpParams = new HttpParams();
  if (params?.limit !== undefined)
    httpParams = httpParams.set('limit', params.limit);
  if (params?.offset !== undefined)
    httpParams = httpParams.set('offset', params.offset);
  if (params?.search) httpParams = httpParams.set('search', params.search);
  return httpParams;
}
