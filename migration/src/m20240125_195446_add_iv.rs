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
    ContentKey,
    ContentIv,
    UserCreatedAt,
}
