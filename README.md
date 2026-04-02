# Alliance

## Setup

The repo root is a **Bun** workspace (hoisted `node_modules`, see `bunfig.toml`); `server/` is a separate Bun package with its own `bun.lock`.

**to install frontend deps**

In root dir: `bun install` (install [Bun](https://bun.sh) 1.3.x+ if missing; `packageManager` in root `package.json` pins `bun@1.3.6`)

**server install:**

`cd server`

`bun install`

`cp .env.example .env` (and make necessary edits)

Set up postgres database running locally with username/password/db name matching .env file

## Running Locally

### frontend

Start the frontend: `cd apps/frontend && bun dev` (or `bun run frontend:dev` from root)

### admin

Start the admin panel: `cd apps/admin && bun dev` (or `bun run admin:dev` from root)

### server

(First time only) install bun 1.3.6: `curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.6"`

Run the migrations: `(cd server && bun migration:run)`

Start the server: `cd server && bun dev` (or `bun server:dev` from root dir)

When opening the app locally for the first time, you can log in with the account specified by `ADMIN_USER` and `ADMIN_PASSWORD` in your .env file (this account will be automatically added to the db on startup)

### Loading data

Developers often want to test local code with a cleaned version of the production database. To allow for this, we have a script, `./misc/load_staging_data.sh` that will copy the data from the staging server into the local postgres. For this to work, you first need to set up your `.ssh/config` with a `staging` destination with the appropriate ssh key (ask an existing developer for the keys / ip)

### mobile

Running the app with expo is a two step process:

- prebuilding / creating the development build (`npx expo prebuild`)
- running the expo dev server which the build connects to. (`npx expo start --dev-client`)

We have a few scripts that do both of these together, as well as installing needed pods deps:

- To build and run on a local simulator: `bun run --cwd apps/mobile build:simulator`
- To build into xcode for app store upload: use the `build:ios` / EAS scripts in `apps/mobile` (see `apps/mobile/package.json`)
- To build and run on a physical device: `npx expo prebuild && cd ios && pod install && cd .. && npx expo run:ios --device [your device id]`

(you can find your device id via `xcrun xctrace list devices`)

## Miscellaneous commands

### Openapi client gen:

`bun run gen-api` (in root dir, dev server must be running)

### Server migrations

generate migrations (in server/): `bun migration:generate -- migrations/[name of migration]`

run migrations `bun migration:run`
