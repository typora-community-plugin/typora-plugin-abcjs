import { I18n, SettingTab } from "@typora-community-plugin/core"
import type FrontMatterPlugin from "./main"
import { DEFAULT_SETTINGS } from "./settings"


export class AbcSettingTab extends SettingTab {

  get name() {
    return 'ABC Music Notation'
  }

  i18n = new I18n({
    resources: {
      'en': {
        codeblockType: 'Codeblock language name',
        codeblockTypeDesc: 'Used to indicate that the codeblock\'s language is ABC music notation.',
      },
      'zh-cn': {
        codeblockType: '代码块语言名',
        codeblockTypeDesc: '用于表示该代码块的语言为 ABC 记谱法。',
      },
    }
  })

  constructor(private plugin: FrontMatterPlugin) {
    super()
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
