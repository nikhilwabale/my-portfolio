# Database setup

## Option 1: EF Core migration

```bash
cd backend/PortfolioApi
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## Option 2: SQL script

Run `database/create-database.sql` in SQL Server Management Studio or Azure Data Studio.
