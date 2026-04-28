export enum RepositoryResult {
  DELETED = 'DELETED',
  NOT_FOUND = 'NOT_FOUND',
  HAS_CONTRACTS = 'HAS_CONTRACTS',
  CONFLICT = 'CONFLICT',
}

export class RepositoryException extends Error {
  constructor(public readonly result: RepositoryResult) {
    super(result);
  }
}
