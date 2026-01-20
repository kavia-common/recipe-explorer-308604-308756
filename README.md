# recipe-explorer-308604-308756

## Frontend (React)

The React client reads the backend API base URL from an environment variable:

- `REACT_APP_API_BASE` (preferred), e.g. `http://localhost:3011/api`

Copy the example env file and adjust as needed:

```bash
cp frontend_client/.env.example frontend_client/.env
```

The backend should expose endpoints under:

- `/api/recipes`
- `/api/recipes/:id`
- `/api/user-recipes`
- `/api/favorites`
- `/api/health`
