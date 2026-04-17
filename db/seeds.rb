require "open-uri"
require "json"

puts "Nettoyage des films existants..."
Bookmark.destroy_all
Movie.destroy_all

url = "https://tmdb.lewagon.com/movie/top_rated"
puts "Récupération des films depuis #{url}..."

response = URI.open(url).read
data = JSON.parse(response)

data["results"].each do |movie|
  poster_path = movie["poster_path"]
  next if poster_path.blank?

  Movie.create!(
    title: movie["title"],
    overview: movie["overview"].presence || "Aucune description disponible.",
    poster_url: "https://image.tmdb.org/t/p/original#{poster_path}",
    rating: movie["vote_average"]
  )
end

puts "#{Movie.count} films créés."
