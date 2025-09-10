import { Module } from '@nestjs/common'
import { LanguageController } from 'src/modules/language/language.controller'
import { LanguageRepo } from 'src/modules/language/repository/language.repo'
import { LanguageService } from 'src/modules/language/language.service'

@Module({
  providers: [LanguageService, LanguageRepo],
  controllers: [LanguageController],
})
export class LanguageModule {}
