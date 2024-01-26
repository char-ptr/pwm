use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts
        manager
            .alter_table(
                Table::alter()
                    .table(User::Table)
                    .add_column_if_not_exists(ColumnDef::new(User::ContentIv).binary())
                    .add_column_if_not_exists(ColumnDef::new(User::PasswordSalt).binary())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts

        manager
            .alter_table(
                Table::alter()
                    .table(User::Table)
                    .drop_column(User::ContentIv)
                    .drop_column(User::PasswordSalt)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum User {
    Table,
    UserId,
    Alias,
    Username,
    Password,
    PasswordSalt,
    ContentKey,
    ContentIv,
    UserCreatedAt,
}
