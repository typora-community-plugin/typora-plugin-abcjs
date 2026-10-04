import * as abcjs from "abcjs"
import { CodeblockPostProcessor, Plugin, PluginSettings, html } from '@typora-community-plugin/core'
import { AbcSettings, DEFAULT_SETTINGS } from "./settings"
import { AbcSettingTab } from "./setting-tab"


export default class extends Plugin<AbcSettings> {

  private lang = DEFAULT_SETTINGS.codeblockType
  private processorDisposable: any
  private highlightDisposable: any

  onload() {

    this.registerSettings(
      new PluginSettings(this.app, this.manifest, {
        version: 1,
      }))

    this.settings.setDefault(DEFAULT_SETTINGS)

    this.registerSettingTab(new AbcSettingTab(this))

    this.registerAbcPostProcessor()
    this.registerCodeblockHighlightMode()
    this.register(
      this.settings.onChange('codeblockType', () => {
        this.unregisterAbcPostProcessor()
        this.unregisterHighlightMode()
        this.registerAbcPostProcessor()
        this.registerCodeblockHighlightMode()
      }))
  }

  registerAbcPostProcessor() {
    this.lang = this.settings.get('codeblockType')

    this.register(
      this.processorDisposable =
      this.app.features.markdownEditor.postProcessor.register(
        CodeblockPostProcessor.from({
          lang: [this.lang],
          exportPreview: true,
          preview: (code, pre) => {
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
    this.processorDisposable && this.processorDisposable()
    $(`pre[lang="${this.lang}"] .md-diagram-panel.md-fences-adv-panel`).remove()
  }

  registerCodeblockHighlightMode() {
    const modeFactory = () => ({
      startState: () => ({ header: false }),
      copyState: (state: any) => ({ header: state.header }),
      blankLine: (state: any) => { state.header = false },
      token: (stream: any, state: any) => {
        if (stream.sol()) state.header = false

        // comment to end of line
        if (stream.match(/^%.*/)) return 'comment'

        // header field (X:, T:, K:, ...) and its value, valid at line start
        if (stream.sol() && stream.match(/^[A-Za-z]:/)) {
          state.header = true
          return 'keyword'
        }
        if (state.header) {
          stream.skipToEnd()
          return 'def'
        }

        if (stream.eatSpace()) return null

        // inline field [K:G] / annotation
        if (stream.match(/^\[[A-Za-z]:/)) return 'keyword'
        // chord [CEG] (do not cross bar lines)
        if (stream.match(/^\[[^\]|]*\]/)) return 'atom'

        // bar lines: | || |] [| :| |: ::
        if (stream.match(/^(\[|\]|\|{1,2}|:{1,2}|:\||\|:)/)) return 'bracket'

        // note with accidental and octave marks
        if (stream.match(/^(\^{1,2}|_{1,2}|=)?[A-Ga-g][,']*/)) return 'variable'
        // rest
        if (stream.match(/^[xz]/)) return 'def'

        // duration and broken rhythm
        if (stream.match(/^\d+(\/\d+)?|^\/{1,2}/)) return 'number'
        if (stream.match(/^[><\-~.]/)) return 'operator'

        // ties, slurs, tuplets
        if (stream.match(/^[()]/)) return 'bracket'

        // grace notes and decorations
        if (stream.match(/^\{[^}]*\}/)) return 'meta'
        if (stream.match(/^![^!]*!|^\+[^+]*\+/)) return 'meta'
        // quoted chord symbol
        if (stream.match(/^"[^"]*"/)) return 'string'

        // lone accidental
        if (stream.match(/^(\^{1,2}|_{1,2}|=+)/)) return 'operator'

        stream.next()
        return null
      }
    })

    this.highlightDisposable = this.app.features.markdownEditor.codeblock.registerMode({
      lang: this.lang,
      mode: modeFactory,
    })
  }

  unregisterHighlightMode() {
    if (this.highlightDisposable) {
      this.highlightDisposable()
    }
  }
}
