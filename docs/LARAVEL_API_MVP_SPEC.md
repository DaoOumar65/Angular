# Laravel API Spec - Budget Tracker (MVP compatible Frontend actuel)

## 1. Objectif
Cette spec couvre uniquement ce que l'API Laravel doit exposer pour faire fonctionner le frontend actuel de facon fiable (auth, depenses, categories, budget, preferences), avant d'ajouter d'autres fonctionnalites.

## 2. Stack Laravel recommandee
- Laravel 11+
- Auth API: Laravel Sanctum (tokens)
- DB: MySQL/MariaDB
- Validation: FormRequest
- Hash password: `Hash::make()` / `Hash::check()`
- Reponses JSON normalisees

## 3. Convention de reponse JSON
## Success
```json
{
  "success": true,
  "message": "optional",
  "data": {}
}
```

## Error
```json
{
  "success": false,
  "message": "Erreur lisible",
  "errors": {
    "field": ["detail"]
  }
}
```

## 4. Authentification (OBLIGATOIRE)
Base URL: `/api/v1`

### POST `/auth/register`
Body:
```json
{
  "nom": "Doe",
  "prenom": "John",
  "telephone": "12345678",
  "password": "secret1234"
}
```
Regles:
- `nom`: required|string|max:100
- `prenom`: required|string|max:100
- `telephone`: required|string|regex:/^[0-9]{8}$/|unique:users,telephone
- `password`: required|string|min:4|max:255

Retour data:
- `user` (sans password)
- `token` (Sanctum)

### POST `/auth/login`
Body:
```json
{
  "telephone": "12345678",
  "password": "secret1234"
}
```
Retour data:
- `user`
- `token`

### POST `/auth/logout` (Bearer token)
- Revoque token courant

### GET `/auth/me` (Bearer token)
- Retourne utilisateur connecte

## 5. Utilisateur
## Table `users`
Champs minimum:
- `id` (bigint)
- `nom` string(100)
- `prenom` string(100)
- `telephone` string(8) unique
- `password` string
- timestamps

## 6. Categories (OBLIGATOIRE)
## Table `categories`
- `id`
- `user_id` FK
- `name` string(80)
- `is_default` boolean default false
- `created_at`, `updated_at`
- unique index (`user_id`,`name`)

### GET `/categories`
- Retourne categories du user

### POST `/categories`
Body: `{ "name": "Transport" }`
Validation: required|string|max:80

### PUT `/categories/{id}`
Body: `{ "name": "Nouveau nom" }`
Important: renommer la categorie doit mettre a jour les depenses associees (transaction DB).

### DELETE `/categories/{id}`
Regle:
- Si `is_default=true`, refuser (409)
- Sinon reassigner toutes les depenses vers categorie `Autre` du user puis supprimer.

## 7. Depenses (OBLIGATOIRE)
## Table `expenses`
- `id`
- `user_id` FK
- `category_id` FK (nullable si legacy, mais prefere non null)
- `description` string(100)
- `amount` decimal(12,2) (stocke en EUR pour coller frontend actuel)
- `date` date
- timestamps
Indexes:
- (`user_id`,`date`)
- (`user_id`,`category_id`)

### GET `/expenses`
Query supporte (important frontend):
- `search` (description like)
- `category_id`
- `date_from`
- `date_to`
- `amount_min`
- `amount_max`
- `sort_by` in `date|amount|category`
- `sort_dir` in `asc|desc`
- `page`, `per_page`

Retour data:
- liste paginee (`data`, `meta`)

### POST `/expenses`
Body:
```json
{
  "description": "Courses",
  "amount": 45.50,
  "category_id": 2,
  "date": "2026-02-13"
}
```
Validation:
- description required|string|max:100
- amount required|numeric|min:0.01|max:10000000
- category_id required|exists:categories,id (scope user)
- date required|date

### POST `/expenses/bulk`
Pour recurrence/frontend import.
Body:
```json
{
  "items": [
    {"description":"Loyer","amount":500,"category_id":3,"date":"2026-02-01"}
  ]
}
```
Validation:
- `items` array|min:1|max:500
- meme regles que POST /expenses sur chaque item

### PUT `/expenses/{id}`
- meme validation que create

### DELETE `/expenses/{id}`
- supprime une depense du user

## 8. Budget et epargne (OBLIGATOIRE)
## Table `budgets`
- `id`
- `user_id` unique
- `daily` decimal(12,2) default 0
- `weekly` decimal(12,2) default 0
- `monthly` decimal(12,2) default 0
- `monthly_savings_goal` decimal(12,2) default 0
- timestamps

### GET `/budget`
Retour:
```json
{
  "daily": 50,
  "weekly": 300,
  "monthly": 1200,
  "monthly_savings_goal": 200
}
```

### PUT `/budget`
Body:
```json
{
  "daily": 50,
  "weekly": 300,
  "monthly": 1200,
  "monthly_savings_goal": 200
}
```
Validation numeric|min:0

## 9. Preferences utilisateur (OBLIGATOIRE)
## Table `user_preferences`
- `id`
- `user_id` unique
- `currency_code` string(3) default `EUR`
- `theme` enum(`light`,`dark`) default `light`
- timestamps

### GET `/preferences`
### PUT `/preferences`
Body:
```json
{
  "currency_code": "EUR",
  "theme": "light"
}
```
Validation:
- currency_code in `EUR,USD,XAF,GBP,JPY,CHF`
- theme in `light,dark`

## 10. Import/Export (MVP)
Le frontend peut deja parser JSON/CSV localement.
MVP backend minimal:
- pas obligatoire de parser CSV cote API
- export cote API optionnel

Si tu veux support API:
- POST `/expenses/import` (json rows)
- GET `/expenses/export?format=json|csv`

## 11. Regles metier transverses
- Toutes les donnees sont scopees par `auth()->id()`
- Interdire acces a une ressource d'un autre user (404/403)
- Transactions DB pour operations de masse (rename category, bulk create)
- Soft delete optionnel (pas obligatoire MVP)

## 12. Codes HTTP attendus
- 200: OK
- 201: created
- 204: delete success
- 401: non authentifie
- 403: interdit
- 404: introuvable
- 409: conflit metier (ex: delete categorie par defaut)
- 422: validation

## 13. Middleware/Routes
- Prefix: `/api/v1`
- Public:
  - `POST /auth/register`
  - `POST /auth/login`
- Protege `auth:sanctum`:
  - `POST /auth/logout`
  - `GET /auth/me`
  - CRUD expenses/categories
  - GET/PUT budget
  - GET/PUT preferences

## 14. Ordre d'implementation recommande
1. Auth (register/login/me/logout)
2. Categories + seed defaults par user (`Alimentation`,`Transport`,`Loisirs`,`Sante`,`Logement`,`Autre`)
3. Expenses CRUD + bulk
4. Budget endpoints
5. Preferences endpoints
6. Filtres/pagination expenses

## 15. Compatibilite frontend actuelle
Pour que le frontend actuel fonctionne "normal":
- Auth async doit recevoir `{success,message,data.user,data.token}`
- Depenses doivent etre renvoyees avec `id,description,amount,category,date`
- Budget doit inclure `daily,weekly,monthly,monthly_savings_goal`
- Preferences doivent inclure `currency_code,theme`

## 16. Non-MVP (a ajouter plus tard)
- Analytics calcules cote API
- Predictif avance (saisonnalite, modele)
- Webhooks/notifications
- Multi-device conflict resolution
- RBAC/roles
