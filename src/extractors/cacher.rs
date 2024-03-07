use futures::Future;
use parking_lot::Mutex;
use std::{fmt::Debug, pin::Pin, sync::Arc, time::Duration};
use tokio::sync::broadcast;
use tracing::{debug, debug_span, error, instrument};

#[derive(Debug, Clone)]
pub enum ReadyCacheState<T: Send + Sync> {
    Ready(T),
    InProgress(broadcast::Sender<T>),
}

type ReadyCacher<T> = mini_moka::sync::Cache<String, ReadyCacheState<T>>;
#[derive(Debug, Clone)]
pub struct ReadyCache<T: Send + Sync> {
    pub cache: Arc<Mutex<ReadyCacher<T>>>,
}
pub enum BroadcastType<T: Send + Sync> {
    Sender(broadcast::Sender<T>),
    Receiver(broadcast::Receiver<T>),
}
impl<T: Send + Sync + Debug + Clone + 'static> ReadyCache<T> {
    pub fn new(cache_expiry: Duration) -> Self {
        Self {
            cache: Arc::new(Mutex::new(
                ReadyCacher::builder()
                    .max_capacity(20_000)
                    .time_to_live(cache_expiry)
                    .build(),
            )),
        }
    }
    #[instrument(skip(lambda, self))]
    pub fn get_or_process(
        &self,
        key: String,
        lambda: impl FnOnce() -> Pin<Box<dyn Future<Output = T> + Send + 'static>> + 'static,
    ) -> Result<T, BroadcastType<T>> {
        let cache_lock = self.cache.lock();
        let cached = cache_lock.get(&key);

        match cached {
            Some(ReadyCacheState::Ready(value)) => Ok(value),
            Some(ReadyCacheState::InProgress(rx)) => Err(BroadcastType::Sender(rx)),
            None => {
                let do_again = self.start_processing(cache_lock, key, lambda);
                Err(BroadcastType::Receiver(do_again))
            }
        }
    }
    #[instrument(skip(lambda))]
    fn start_processing(
        &self,
        cache: parking_lot::MutexGuard<ReadyCacher<T>>,
        key: String,
        lambda: impl FnOnce() -> Pin<Box<dyn Future<Output = T> + Send + 'static>> + 'static,
    ) -> broadcast::Receiver<T> {
        let (tx, rx) = broadcast::channel(1);
        cache.insert(key.to_string(), ReadyCacheState::InProgress(tx.clone()));
        drop(cache);
        let fut = lambda();
        let cachee = self.cache.clone();
        // let span = debug_span!("cache processing", key = key);
        tokio::spawn(async move {
            debug!("awaiting cache future");
            let res = fut.await;
            debug!("finished cache future sending data");
            tx.send(res.clone());
            cachee
                .lock()
                .insert(key.to_string(), ReadyCacheState::Ready(res));
        });
        rx
    }
}
