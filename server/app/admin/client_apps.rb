ActiveAdmin.register ClientApp do

  config.sort_order = 'github_repo_asc'
  menu if: proc{ current_user.is_admin } # Show in ActiveAdmin menu?

  index do
    selectable_column
    id_column
    column :name
    column :app_url
    column :users
    column :github_repo
    column :git_branch
    actions
  end

  show do
    attributes_table do
      row :name
      row :app_url
      row :adapter
      row :github_repo
      row :git_branch
      row :github_api_token
      row :github_user
      row :users

      row :created_at
      row :updated_at
    end
  end

  action_item :test_github_access, only: [:show, :edit]  do
    link_to 'Test Github Access', test_github_access_admin_client_app_path(id: resource.id)
  end

  member_action :test_github_access, method: :get do
    client_app = resource
    status = client_app.lexicon_adapter.test_access
    if status[:succeeded]
      flash[:notice] = status[:msgs].join('  ')
    else
      flash[:error] = status[:msgs].join('  ')
    end
    redirect_to admin_client_app_path(id: client_app)
  end

  permit_params do
    [
      :name,
      :app_url,
      :adapter,
      :github_repo,
      :git_branch,
      :github_api_token,
      :github_user,
      {
        user_ids: []
      }
    ]
  end

  form do |f|
    f.inputs do
      input :name, hint: 'Something readable by users'
      input :app_url, hint: 'Where is the app hosted? Where should the Apps to Edit page link to?'
      input :adapter, hint: '"github" or "file"'
      input :github_repo, hint: 'Where should Lexicon edits be saved? Only for github adapter'
      input :git_branch, hint: 'Which branch should Lexicon use? The branch must already exist.'
      input :github_user, hint: 'For security, make a new GitHub user with access to just this one repo.'
      input :github_api_token, hint: 'Personal access token. Give it "repo" access'
      input :users, as: :select, multiple: true,
        collection: User.all.map{|user| [user.email, user.id]}
    end
    actions
  end
end
