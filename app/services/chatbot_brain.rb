class ChatbotBrain
  STOPWORDS = %w[
    un une le la les de du des d et ou a à au aux
    je tu il elle on nous vous ils elles
    mon ma mes ton ta tes son sa ses
    ce cet cette ces
    est sont suis sommes êtes était étaient
    propose proposes proposez moi toi nous vous
    film films movie movies
    veux voudrais voudrait pour avec sans
    un une some any
    please stp svp merci thanks
  ].to_set

  GREETING_REGEX    = /\b(salut|bonjour|bonsoir|allo|coucou|hello|hi|hey)\b/i
  RANDOM_REGEX      = /\b(propose|sugg[èe]re|surprise|hasard|random|au\s+pif|n[''']importe)\b/i
  TOP_RATED_REGEX   = /\b(bien\s*not[ée]|chef\s*-?\s*d[''']\s*œuvre|chef\s*-?\s*d[''']\s*oeuvre|top|excellent|masterpiece|meilleur|incontournable)\b/i

  def self.respond_to(message)
    new(message).respond
  end

  def initialize(message)
    @raw = message.to_s
    @text = @raw.downcase.strip
  end

  def respond
    return help_message if @text.empty?
    return greeting    if @text.match?(GREETING_REGEX) && word_count < 4

    if @text.match?(TOP_RATED_REGEX)
      movie = Movie.where("rating >= ?", 7.5).order(Arel.sql("RANDOM()")).first
      return { reply: "Un film très bien noté pour toi:", movie: movie } if movie
    end

    if (keyword = first_keyword).present?
      like = "%#{keyword}%"
      movie = Movie
                .where("LOWER(title) LIKE ? OR LOWER(overview) LIKE ?", like, like)
                .order(Arel.sql("RANDOM()"))
                .first
      return { reply: "Voici ce que j'ai trouvé pour \"#{keyword}\":", movie: movie } if movie
    end

    if @text.match?(RANDOM_REGEX)
      movie = Movie.order(Arel.sql("RANDOM()")).first
      return { reply: "Tiens, une suggestion au hasard:", movie: movie } if movie
    end

    # Nothing matched — fallback: try random anyway, else help
    if (fallback = Movie.order(Arel.sql("RANDOM()")).first)
      return { reply: "Je n'ai rien trouvé de précis, mais tu vas peut-être aimer celui-ci:", movie: fallback }
    end

    help_message
  end

  private

  def word_count
    @text.split(/\s+/).size
  end

  def first_keyword
    @text
      .split(/[^a-zà-ÿ0-9]+/i)
      .reject { |w| w.length < 3 || STOPWORDS.include?(w) }
      .first
  end

  def greeting
    {
      reply: "Salut ! 🎬 Dis-moi ce que tu cherches : un film au hasard, un chef-d'œuvre, ou un thème (action, romance, guerre...)."
    }
  end

  def help_message
    {
      reply: "Je peux te proposer un film. Essaie par exemple : « propose-moi un film », « un chef-d'œuvre », ou « un film d'action »."
    }
  end
end
