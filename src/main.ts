import * as abcjs from "abcjs"
import { CodeblockPostProcessor, Plugin, PluginSettings, html } from '@typora-community-plugin/core'
import { AbcSettings, DEFAULT_SETTINGS } from "./settings"
import { AbcSettingTab } from "./setting-tab"


export default class extends Plugin<AbcSettings> {

  private lang: string
  private processorDisposable: any

  onload() {

    this.registerSettings(
      new PluginSettings(this.app, this.manifest, {
        version: 1,
      }))

    this.settings.setDefault(DEFAULT_SETTINGS)

    this.registerSettingTab(new AbcSettingTab(this))

    this.registerAbcPostProcessor()
    this.register(
      this.settings.onChange('codeblockType', () => {
        this.unregisterAbcPostProcessor()
        this.registerAbcPostProcessor()
      }))
  }

  registerAbcPostProcessor() {
    this.lang = this.settings.get('codeblockType')

    this.register(
      this.processorDisposable =
      this.app.workspace.activeEditor.postProcessor.register(
        CodeblockPostProcessor.from({
          lang: [this.lang],
          preview: async (code, pre) => {
            const el = (pre.querySelector('.md-diagram-panel-preview .abcjs-container')
              ?? html`<div class="abcjs-container">`) as HTMLElement

            abcjs.renderAbc(el, code, {
              responsive: "resize",
            })

            return el
          }
        })
      ))
  }

  unregisterAbcPostProcessor() {
    this.processorDisposable()
    this.unregister(this.processorDisposable)

    $(`pre[lang="${this.lang}"] .md-diagram-panel.md-fences-adv-panel`).remove()
  }
}
