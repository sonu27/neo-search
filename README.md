## Running locally
You will need the latest version of Docker for Mac, and any commands ran must be within the root of this folder.

Create `local.json` in the `config` folder with correct configuration, you only need to override values different from `default.json`. You can also use environment variables to override config.

Run `docker-compose up -d`

Wait about a minute for everything to boot up.

Then run `docker exec api ./import_scripts/run.sh` to begin the import process, this can take up to an hour.
