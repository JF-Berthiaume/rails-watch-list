import { Controller } from "@hotwired/stimulus"
import * as bootstrap from "bootstrap"

export default class extends Controller {
  static targets = ["collapse"]

  close() {
    if (!this.hasCollapseTarget) return
    const el = this.collapseTarget
    if (!el.classList.contains("show")) return

    bootstrap.Collapse.getOrCreateInstance(el).hide()
  }
}
