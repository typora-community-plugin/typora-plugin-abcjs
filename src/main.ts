import * as abcjs from "abcjs"
import { CodeblockPostProcessor, Plugin, html } from '@typora-community-plugin/core'


export default class extends Plugin {

  onload() {

    this.registerMarkdownPostProcessor(
      CodeblockPostProcessor.from({
        lang: ['abc'],
        preview: async (code, pre) => {
          const el = (pre.querySelector('.md-diagram-panel-preview .abcjs-container')
            ?? html`<div class="abcjs-container">`) as HTMLElement

          abcjs.renderAbc(el, code, {
            responsive: "resize",
          })

          return el
        }
      }))
  }
}
