ActiveAdmin.register ClientApp do

  menu if: proc{ current_user.is_admin } # Show in ActiveAdmin menu?

  index do
    selectable_column
    id_column
    column :name
    column :app_url
    column :users
    column :git_branch
    column :adapter
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
      input :git_branch, hint: 'Which branch should Lexicon use?'
      input :github_user, hint: 'For security, make a new GitHub user with access to just this one repo.'
      input :github_api_token, hint: 'Personal access token. Give it "repo" access'
      input :users, as: :select, multiple: true,
        collection: User.all.map{|user| [user.email, user.id]}
    end
    actions
  end
end
