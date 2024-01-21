-- Add migration script here
alter table pwm_users
    alter column user_created_at set default now(),
    add constraint pwm_users_username_pk
        unique (username);
-- alter table pwm_access_token
--     add constraint pwm_access_token_user_id_pk
--         unique (user_id)
