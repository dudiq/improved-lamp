import lz from 'lz-string'
import { Inject, Service } from '@pv/di'
import { MessageBoxService } from '@pv/modules/message-box'
import { t } from '@pv/interface/services/i18n'
import { ExportDatabaseValueObject } from '../../core/value-object/export-database.value-object'
import { SettingsAdapter } from '../../infra/settings.adapter'
import { FileService } from './file.service'
import { DropAllService } from './drop-all.service'

@Service()
export class ImportFinService {
  constructor(
    @Inject()
    private messageBoxService: MessageBoxService,
    @Inject()
    private fileService: FileService,
    @Inject()
    private settingsAdapter: SettingsAdapter,
    @Inject()
    private dropAllService: DropAllService,
  ) {}

  private static decompressFromBase64<T>(data: string): T | null {
    try {
      let str = lz.decompressFromBase64(data)
      if (!str) {
        str = data
      }
      return JSON.parse(str)
    } catch (e) {
      return null
    }
  }

  async importFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    const content = await this.fileService.readTextFile<string>(files[0])
    const result = ImportFinService.decompressFromBase64<ExportDatabaseValueObject>(content)
    if (!result) return
    if (!result.dbVersion) return
    if (!result.data) return

    this.dropAllService.dropRelatedStores()
    const importResult = await this.settingsAdapter.importData(result.data)
    if (importResult.isErr()) {
      await this.messageBoxService.alert(t('settings.importError'))
      return
    }

    await this.messageBoxService.alert(t('settings.importDone'))

    //TODO: add reload data to pouch and all other pages
  }
}
