Rails.application.routes.draw do
  #
  # For Clearance gem
  #
  resources :passwords, controller: "clearance/passwords", only: %i[create new]
  resource :session, controller: "clearance/sessions", only: [:create]

  resources :users, controller: "clearance/users", only: [:create] do
    resource :password,
             controller: "clearance/passwords",
             only: %i[create edit update]
  end

  get "/sign_in" => "clearance/sessions#new", :as => "sign_in"
  delete "/sign_out" => "clearance/sessions#destroy", :as => "sign_out"
  # get "/sign_up" => "clearance/users#new", as: "sign_up"

  ActiveAdmin.routes(self)

  #
  # Lexicon routes
  #
  root "welcome#index"
  get "/demo", to: "welcome#demo"
  get "/demo_multiple_providers", to: "welcome#demo_multiple_providers"
  get "/edit", to: "welcome#edit"
  get "/testing", to: "welcome#testing"

  get "/contact", to: "welcome#contact"
  get "/features", to: "welcome#features"
  get "/pricing", to: "welcome#pricing"

  # API routes
  put "/update", to: "api#update"
  put "/cookie_auth_update", to: "api#cookie_auth_update"
end
