create Extension if not exists "pgcrypto";

create type pwm_match_detection as enum ('exact', 'contains', 'starts_with', 'ends_with');

CREATE TABLE IF NOT EXISTS pwm_users (
  user_id UUID PRIMARY KEY,
  username text NOT NULL,
  password text not null,
  content_key text not null,
  user_created_at timestamp not null,
  first_name text
);
create table if not exists pwm_access_token (
  access_token uuid primary key,
  user_id uuid not null references pwm_users(user_id),
  expire_at timestamp not null 
);
create table if not exists pwm_vault (
  vault_id uuid primary key,
  user_id uuid not null references pwm_users(user_id)
);
create table if not exists pwm_vault_folder (
  folder_id uuid primary key,
  vault_id uuid not null references pwm_vault(vault_id),
  name text not null,
  parent_folder_id uuid references pwm_vault_folder(folder_id)
);
create table if not exists pwm_vault_item (
  item_id uuid primary key,
  vault_id uuid not null references pwm_vault(vault_id),
  folder_id uuid references pwm_vault_folder(folder_id),
  name text not null,
  username text,
  password text,
  icon_url text,
  notes text,
  custom_fields jsonb
);

create table if not exists pwm_vault_website (
  id uuid primary key,
  vault_item_id uuid not null references pwm_vault_item(item_id),
  uri text not null,
  match_detection pwm_match_detection
);

