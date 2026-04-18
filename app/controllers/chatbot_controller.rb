class ChatbotController < ApplicationController
  def message
    result = ChatbotBrain.respond_to(params[:message])
    render json: {
      reply: result[:reply],
      movie: serialize_movie(result[:movie]),
      lists: List.order(:name).pluck(:id, :name).map { |id, name| { id: id, name: name } }
    }
  end

  def add_to_list
    list = List.find_by(id: params[:list_id])
    movie = Movie.find_by(id: params[:movie_id])

    return render json: { success: false, error: "Liste ou film introuvable." }, status: :not_found unless list && movie

    bookmark = list.bookmarks.build(movie: movie, comment: "Ajouté via le chatbot 🎬")

    if bookmark.save
      render json: { success: true, list_name: list.name }
    else
      render json: { success: false, error: bookmark.errors.full_messages.first || "Impossible d'ajouter." }, status: :unprocessable_entity
    end
  end

  private

  def serialize_movie(movie)
    return nil unless movie

    {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      rating: movie.rating,
      poster_url: movie.poster_url
    }
  end
end
