import { CreateLanguageBodyType, LanguageType, UpdateLanguageBodyType } from '../models/language.model'

export interface ILanguageRepository {
  findAll(): Promise<LanguageType[]>
  findById(id: string): Promise<LanguageType | null>
  create({ createdById, data }: { createdById: number; data: CreateLanguageBodyType }): Promise<LanguageType>
  update({
    id,
    updatedById,
    data,
  }: {
    id: string
    updatedById: number
    data: UpdateLanguageBodyType
  }): Promise<LanguageType>
  delete(id: string, isHard?: boolean): Promise<LanguageType>
}
