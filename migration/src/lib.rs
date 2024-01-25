pub use sea_orm_migration::prelude::*;

mod m20240122_101536_init_tables;
mod m20240125_195446_add_iv;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20240122_101536_init_tables::Migration),
            Box::new(m20240125_195446_add_iv::Migration),
        ]
    }
}
