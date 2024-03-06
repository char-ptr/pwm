#![feature(lazy_cell)]

use std::{fmt::Debug, ops::Deref};

use axum_client_ip::SecureClientIpSource;
use clap::ValueEnum;
use sea_orm::DbConn;
use serde::Serialize;
pub mod db;
pub mod errors;
pub mod extractors;
pub mod routes;

#[repr(transparent)]
#[derive(Debug, Clone)]
pub struct PwmState(DbConn);

#[derive(Serialize, Clone, Debug)]
pub enum PwmStatus {
    Success,
    Failure {
        why: &'static str,
        fix: Option<&'static str>,
    },
}
#[derive(Serialize, Clone, Debug)]
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
    type Target = DbConn;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
#[derive(Debug, Clone, ValueEnum)]
pub enum SecureIp {
    RightmostForwarded,
    RightmostForwardedFor,
    XRealIp,
    FlyClientIp,
    TrueClientIp,
    CfConnectingIp,
    ConnectInfo,
}
impl From<SecureIp> for SecureClientIpSource {
    fn from(value: SecureIp) -> Self {
        match value {
            SecureIp::FlyClientIp => SecureClientIpSource::FlyClientIp,
            SecureIp::RightmostForwarded => SecureClientIpSource::RightmostForwarded,
            SecureIp::RightmostForwardedFor => SecureClientIpSource::RightmostXForwardedFor,
            SecureIp::XRealIp => SecureClientIpSource::XRealIp,
            SecureIp::TrueClientIp => SecureClientIpSource::TrueClientIp,
            SecureIp::CfConnectingIp => SecureClientIpSource::CfConnectingIp,
            SecureIp::ConnectInfo => SecureClientIpSource::ConnectInfo,
        }
    }
}
