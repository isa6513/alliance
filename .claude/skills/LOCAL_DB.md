# Local Database Access

Local Postgres on `localhost:5432`. Credentials in `server/.env`: user `postgres`, password `alliance`, database `alliance`.

## Ad-hoc queries

```bash
PGPASSWORD=alliance psql -h localhost -p 5432 -U postgres -d alliance -c "SELECT ..."
```

## Notes

- Table names: snake_case from TypeORM entity classes (`ReminderGroup` → `reminder_group`).
- Column names: keep entity camelCase, must be double-quoted in SQL (`"newStatus"`).
- Test DB (`server/.env.test`): password `postgres`, database `postgres` — don't mix up with dev DB.
