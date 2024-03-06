use std::fmt::Debug;
use std::ops::Deref;
use std::sync::Arc;
use std::{collections::HashMap, time::Duration};

use axum::extract::FromRef;
use axum::http::StatusCode;
use axum::Json;
use chrono::Utc;
use dashmap::mapref::one::{MappedRef, RefMut};
use dashmap::{mapref::one::Ref, DashMap};
use parking_lot::RwLock;
use sea_orm::prelude::DateTimeUtc;
use tokio::{sync::broadcast, time::Instant};
use tracing::instrument;

use crate::PwmResponse;

#[derive(Debug)]
pub struct Cacher<T: Send + Sync> {
    cached_values: DashMap<String, (T, DateTimeUtc)>,
    cache_expiry: Duration,
    last_cleaned: RwLock<Instant>,
}
impl<T: Send + Sync> Cacher<T> {
    pub fn new(cache_expiry: Duration) -> Self {
        Self {
            cached_values: DashMap::new(),
            cache_expiry,
            last_cleaned: RwLock::new(Instant::now()),
        }
    }
    pub fn invalidate(&self) {
        self.cached_values.clear();
    }
    pub fn invalidate_key(&self, key: &str) {
        self.cached_values.remove(key);
    }
    pub fn get(&self, key: &str) -> Option<MappedRef<'_, String, (T, DateTimeUtc), T>> {
        self.clean_cache();
        let x = self.cached_values.get(key).map(|x| x.map(|x| &x.0));
        x
    }
    pub fn insert(&self, key: String, value: T) {
        self.clean_cache();
        self.cached_values.insert(key, (value, Utc::now()));
    }
    fn get_no_check(&self, key: &str) -> Option<Ref<String, (T, DateTimeUtc)>> {
        self.cached_values.get(key)
    }
    fn clean_cache(&self) {
        let cleaning_due = {
            let last_cleaned = self.last_cleaned.read();
            let elapsed = last_cleaned.elapsed();
            (elapsed > self.cache_expiry, elapsed)
        };
        if cleaning_due.0 {
            self.cached_values
                .retain(|_k, _| cleaning_due.1 < self.cache_expiry);
            *self.last_cleaned.write() = Instant::now();
        }
    }
}
pub type ReadyCacheStore<T> = Result<T, (StatusCode, Json<PwmResponse>)>;
#[derive(Debug, Clone)]
pub struct ReadyCache<T: Send + Sync> {
    pub cache: Arc<Cacher<ReadyCacheStore<T>>>,
    pub in_progress: Arc<DashMap<String, broadcast::Sender<ReadyCacheStore<T>>>>,
}
impl<T: Send + Sync + Debug + Clone> ReadyCache<T> {
    pub fn new(cache_expiry: Duration) -> Self {
        Self {
            cache: Arc::new(Cacher::new(cache_expiry)),
            in_progress: Arc::new(DashMap::new()),
        }
    }
    #[instrument]
    pub fn start_processing(&self, key: String) {
        let (tx, rx) = broadcast::channel(1);
        self.in_progress.insert(key, tx.clone());
    }
    #[instrument]
    pub fn finish_processing(&self, key: &str, value: ReadyCacheStore<T>) {
        self.cache.insert(key.to_string(), value);
        let Some(ref_to_new) = self.cache.get_no_check(key) else {
            return;
        };
        let in_progress = self.in_progress.get(key).map(|x| x.clone());
        if let Some(in_progress) = in_progress {
            in_progress.send(ref_to_new.value().clone().0).ok();
            // self.in_progress.remove(key);
        }
    }
}
