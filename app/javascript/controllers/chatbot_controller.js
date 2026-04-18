import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["panel", "bubble", "messages", "input", "form"]
  static values  = {
    messageUrl: String,
    addUrl: String
  }

  connect() {
    this.addBotMessage(
      "Salut 🎬 ! Dis-moi ce que tu cherches : « propose-moi un film », « un chef-d'œuvre », ou un thème (action, romance, guerre...).",
      null,
      []
    )
  }

  toggle() {
    this.panelTarget.classList.toggle("is-open")
    this.bubbleTarget.classList.toggle("is-hidden")
    if (this.panelTarget.classList.contains("is-open")) {
      setTimeout(() => this.inputTarget.focus(), 150)
    }
  }

  close() {
    this.panelTarget.classList.remove("is-open")
    this.bubbleTarget.classList.remove("is-hidden")
  }

  async submit(event) {
    event.preventDefault()
    const message = this.inputTarget.value.trim()
    if (!message) return

    this.addUserMessage(message)
    this.inputTarget.value = ""
    this.inputTarget.disabled = true

    try {
      const response = await fetch(this.messageUrlValue, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-Token": this.csrfToken()
        },
        body: JSON.stringify({ message })
      })

      const data = await response.json()
      this.addBotMessage(data.reply, data.movie, data.lists || [])
    } catch (err) {
      this.addBotMessage("Oups, problème de connexion. Réessaie dans un instant.", null, [])
    } finally {
      this.inputTarget.disabled = false
      this.inputTarget.focus()
    }
  }

  async addToList(event) {
    const button = event.currentTarget
    const card   = button.closest(".chatbot-movie-card")
    const select = card.querySelector("[data-chatbot-list-select]")
    const movieId = button.dataset.movieId
    const listId  = select.value

    if (!listId) return

    button.disabled = true
    button.textContent = "Ajout..."

    try {
      const response = await fetch(this.addUrlValue, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-Token": this.csrfToken()
        },
        body: JSON.stringify({ movie_id: movieId, list_id: listId })
      })
      const data = await response.json()

      if (data.success) {
        const selectedName = select.options[select.selectedIndex].textContent
        this.replaceCardAction(card, `✓ Ajouté à "${selectedName}"`, "ok")
      } else {
        this.replaceCardAction(card, data.error || "Impossible d'ajouter.", "err")
        button.disabled = false
        button.textContent = "Ajouter à la liste"
      }
    } catch (err) {
      this.replaceCardAction(card, "Erreur réseau.", "err")
      button.disabled = false
      button.textContent = "Ajouter à la liste"
    }
  }

  addUserMessage(text) {
    const wrap = document.createElement("div")
    wrap.className = "chatbot-msg chatbot-msg-user"
    wrap.textContent = text
    this.messagesTarget.appendChild(wrap)
    this.scrollDown()
  }

  addBotMessage(text, movie, lists) {
    const wrap = document.createElement("div")
    wrap.className = "chatbot-msg chatbot-msg-bot"
    wrap.textContent = text
    this.messagesTarget.appendChild(wrap)

    if (movie) {
      this.messagesTarget.appendChild(this.buildMovieCard(movie, lists))
    }

    this.scrollDown()
  }

  buildMovieCard(movie, lists) {
    const card = document.createElement("div")
    card.className = "chatbot-movie-card"

    const poster = document.createElement("div")
    poster.className = "chatbot-movie-poster"
    if (movie.poster_url) {
      const img = document.createElement("img")
      img.src = movie.poster_url
      img.alt = movie.title
      img.loading = "lazy"
      poster.appendChild(img)
    }
    if (movie.rating) {
      const rating = document.createElement("span")
      rating.className = "chatbot-movie-rating"
      rating.textContent = `${Number(movie.rating).toFixed(1)} ★`
      poster.appendChild(rating)
    }
    card.appendChild(poster)

    const body = document.createElement("div")
    body.className = "chatbot-movie-body"

    const title = document.createElement("h4")
    title.className = "chatbot-movie-title"
    title.textContent = movie.title
    body.appendChild(title)

    if (movie.overview) {
      const overview = document.createElement("p")
      overview.className = "chatbot-movie-overview"
      overview.textContent = movie.overview
      body.appendChild(overview)
    }

    const action = document.createElement("div")
    action.className = "chatbot-movie-action"

    if (lists.length === 0) {
      const note = document.createElement("p")
      note.className = "chatbot-movie-note"
      note.textContent = "Crée d'abord une liste pour pouvoir l'ajouter."
      action.appendChild(note)
    } else {
      const select = document.createElement("select")
      select.className = "form-select form-select-sm chatbot-movie-select"
      select.setAttribute("data-chatbot-list-select", "")
      lists.forEach((l, i) => {
        const opt = document.createElement("option")
        opt.value = l.id
        opt.textContent = l.name
        if (i === 0) opt.selected = true
        select.appendChild(opt)
      })

      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "btn btn-sm btn-success chatbot-movie-btn"
      btn.dataset.movieId = movie.id
      btn.dataset.action = "click->chatbot#addToList"
      btn.textContent = "Ajouter à la liste"

      action.appendChild(select)
      action.appendChild(btn)
    }

    body.appendChild(action)
    card.appendChild(body)
    return card
  }

  replaceCardAction(card, text, status) {
    const action = card.querySelector(".chatbot-movie-action")
    if (!action) return
    action.innerHTML = ""
    const note = document.createElement("p")
    note.className = `chatbot-movie-note chatbot-movie-note-${status}`
    note.textContent = text
    action.appendChild(note)
  }

  scrollDown() {
    this.messagesTarget.scrollTop = this.messagesTarget.scrollHeight
  }

  csrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]')
    return meta ? meta.getAttribute("content") : ""
  }
}
