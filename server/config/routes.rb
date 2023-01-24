Rails.application.routes.draw do
  #
  # for Clearance gem
  #
  resources :passwords, controller: "clearance/passwords", only: [:create, :new]
  resource :session, controller: "clearance/sessions", only: [:create]

  resources :users, controller: "clearance/users", only: [:create] do
    resource :password,
      controller: "clearance/passwords",
      only: [:create, :edit, :update]
  end

  get "/sign_in" => "clearance/sessions#new", as: "sign_in"
  delete "/sign_out" => "clearance/sessions#destroy", as: "sign_out"
  # get "/sign_up" => "clearance/users#new", as: "sign_up"

  ActiveAdmin.routes(self)

  #
  # Lexicon routes
  #

  root 'welcome#index'
  get '/edit' => 'welcome#edit'
  get '/demo' => 'welcome#demo'
  get '/testing' => 'welcome#testing'

  # API routes
  put '/update' => 'api#update'
  put '/cookie_auth_update' => 'api#cookie_auth_update'

end
