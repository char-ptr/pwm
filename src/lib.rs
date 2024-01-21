#![feature(lazy_cell)]

use std::{fmt::Debug, ops::Deref};

use serde::Serialize;
use sqlx::PgPool;
pub mod db;
pub mod errors;
pub mod routes;

#[repr(transparent)]
#[derive(Debug, Clone)]
pub struct PwmState(PgPool);

#[derive(Serialize, Clone)]
pub enum PwmStatus {
    Success,
    Failure {
        why: &'static str,
        fix: Option<&'static str>,
    },
}
#[derive(Serialize, Clone)]
pub struct PwmResponse<S: Serialize + Clone = ()> {
    status: PwmStatus,
    data: Option<S>,
}

impl PwmResponse {
    pub const fn success<S>(data: S) -> PwmResponse<S>
    where
        S: Serialize + Clone,
    {
        PwmResponse {
            status: PwmStatus::Success,
            data: Some(data),
        }
    }
    pub const fn failure(why: &'static str, fix: Option<&'static str>) -> PwmResponse {
        PwmResponse {
            status: PwmStatus::Failure { why, fix },
            data: None,
        }
    }
}
impl Deref for PwmState {
    type Target = PgPool;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
