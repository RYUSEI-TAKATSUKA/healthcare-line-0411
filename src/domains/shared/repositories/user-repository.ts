export interface UserRepository {
  findOrCreateByExternalId(externalId: string): Promise<string>;
}
