# Local Database Access

The local Postgres DB runs on `localhost:5432`. Credentials live in `server/.env`:

- host: `localhost`
- port: `5432`
- user: `postgres`
- password: `alliance`
- database: `alliance`

## Running ad-hoc queries

```bash
PGPASSWORD=alliance psql -h localhost -p 5432 -U postgres -d alliance -c "SELECT ..."
```

## Notes

- Table names are snake_case from TypeORM entity class names (`ReminderGroup` → `reminder_group`, `ActionEvent` → `action_event`).
- Column names preserve the entity's camelCase and must be double-quoted in SQL (e.g. `"newStatus"`, `"memberActionEventId"`).
- The test DB (`server/.env.test`) uses password `postgres` and database `postgres` — don't confuse it with the dev DB.
