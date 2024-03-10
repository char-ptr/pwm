# pwm
PassWord Manager

## why
I've used multiple (self hosted?) password managers. And i feel unsatisfied with them all.

For example with Bitwarden the syncing is very good and is an enjoyable experience, but the integration with browser is poor and i feel like it doesn't have the same versatility as with KeepassXC.
But i can't use KeepassXC because it doesn't have syncing capabilities and found myself constantly running into conflicting data using external syncing systems (such as syncthing).

So with this project i wish to make the best password manager for me.

## about the security
I want to make this a zero knowledge server and make all of encryption and decryption happen on the client. So far the server is a glorified database with authentication thrown on top.

Nextjs is used in dynamic mode at the moment, although i want to be able to switch to static mode for "native" clients in the future. As of right now it provides better caching and overall improvements to UX.
All data passed into Nextjs is encrypted or hashed before hand, so there is no concern in that regard.

## structure of this project
I have used rust for the backend, with the Axum framework. I want the server to be as robust as possible, having as little failure points as possible. Ideally the server is able to handle everything and never goes down.
The client uses Nextjs and can be found in the pwm-web folder.
The database uses postgres, nothing really too interesting with that. I use an orm (SeaOrm) but primarily just to scaffold the types. And query which proves complex with ORM i will instantly use the backdoor to raw queries.

Docker is also used and is the intended way to host, although it is very possible and easy to do so without.

## setup

### setup dev in docker

Follow steps below but instead of running docker compose up blah blah just run the `run.sh` script.

### setup docker

Edit password in db/password.txt, then run
```sh
docker compose up -d # -d is recommended if you want to run in the background
```

### setup manual
create a .env with 
```
DATABASE_URL=postgres://pgusername:pgpassword@pghost:pgport/pgdatabase
```
replacing (pg*) with corresponding data. You should be able to run / build

## PREVIEW (early stage)
![Dash](https://github.com/pozm/pwm/assets/44528100/19d48c45-1139-491c-aa5a-75e54a8e10d1)

