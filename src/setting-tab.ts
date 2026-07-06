import { I18n, path, SettingTab } from "@typora-community-plugin/core"
import type FrontMatterPlugin from "./main"
import { DEFAULT_SETTINGS } from "./settings"
import * as Locale from './locales/lang.en.json'


export class AbcSettingTab extends SettingTab {

  get name() {
    return 'ABC Music Notation'
  }

  i18n!: I18n<typeof Locale>

  constructor(private plugin: FrontMatterPlugin) {
    super()

    this.i18n = new I18n<typeof Locale>({
      localePath: path.join(plugin.manifest.dir!, 'locales')
    })
  }

  show() {
    const { plugin } = this
    const { t } = this.i18n

    this.containerEl.innerHTML = ''

    this.addSetting(setting => {
      setting.addName(t.codeblockType)
      setting.addDescription(t.codeblockTypeDesc)
      setting.addText(input => {
        input.value = plugin.settings.get('codeblockType')
        input.placeholder = DEFAULT_SETTINGS.codeblockType
        input.oninput = () => {
          plugin.settings.set('codeblockType', input.value ?? DEFAULT_SETTINGS.codeblockType)
        }
      })
    })

    super.show()
  }
}
