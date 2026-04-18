Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  root to: "lists#index"
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  resources :lists, only: [:index, :show, :new, :create, :edit, :update, :destroy] do
    # On imbrique NEW et CREATE car on a besoin de l'ID de la liste pour créer le lien
    resources :bookmarks, only: [:new, :create]
  end
  # On laisse DESTROY à l'extérieur car l'ID du bookmark suffit pour le supprimer
  resources :bookmarks, only: [:edit, :update, :destroy]

  post "/chatbot/message",     to: "chatbot#message"
  post "/chatbot/add_to_list", to: "chatbot#add_to_list"

  get "up" => "rails/health#show", as: :rails_health_check
  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
