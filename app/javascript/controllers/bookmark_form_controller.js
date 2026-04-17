import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["movieId", "carousel", "customField", "customInput", "comment"]

  connect() {
    this.syncFromActiveSlide()
    this.carouselTarget.addEventListener("slid.bs.carousel", this.onSlide)
  }

  disconnect() {
    this.carouselTarget.removeEventListener("slid.bs.carousel", this.onSlide)
  }

  onSlide = (event) => {
    const slide = event.relatedTarget
    if (slide && slide.dataset.movieId) {
      this.movieIdTarget.value = slide.dataset.movieId
    }
  }

  syncFromActiveSlide() {
    const active = this.carouselTarget.querySelector(".carousel-item.active")
    if (active && active.dataset.movieId) {
      this.movieIdTarget.value = active.dataset.movieId
    }
  }

  selectPreset(event) {
    const value = event.target.value
    if (value === "__custom__") {
      this.customFieldTarget.hidden = false
      this.commentTarget.value = this.customInputTarget.value
      this.customInputTarget.focus()
    } else {
      this.customFieldTarget.hidden = true
      this.commentTarget.value = value
    }
  }

  updateCustom(event) {
    this.commentTarget.value = event.target.value
  }
}
