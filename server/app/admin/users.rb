ActiveAdmin.register User do

  menu if: proc{ current_user.is_admin } # Show in ActiveAdmin menu?

  # See permitted parameters documentation:
  # https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters

  index do
    selectable_column
    id_column
    column :email
    column :is_admin
    column :updated_at
    actions
  end

  show do
    attributes_table do
      row :is_admin
      row :email
      row :client_apps
      row :created_at
      row :updated_at
      row :encrypted_password
      row :confirmation_token
      row :remember_token
    end
  end

  permit_params do
    permitted = [:email, :password, :is_admin, {client_app_ids: []}]
    permitted << :other if params[:action] == 'create' && current_user.is_admin
    permitted
  end

  form do |f|
    f.inputs do
      input :email
      input :password
      input :is_admin, hint: 'Admins can configure Lexicon. Clients who want to edit content should not be admins'
      input :client_apps, as: :select, multiple: true,
        collection: ClientApp.all.map{|ca| [ca.title, ca.id]}
    end
    actions
  end

end
