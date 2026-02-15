# Laravel API Spec - Budget Tracker (Version Complète)

## Extensions API pour fonctionnalités avancées

### 17. Dépenses récurrentes (NOUVEAU)

#### Table `recurring_expenses`
```sql
- id bigint
- user_id FK
- category_id FK
- description string(100)
- amount decimal(12,2)
- frequency enum('daily','weekly','monthly','yearly')
- start_date date
- end_date date nullable
- is_active boolean default true
- last_generated_at timestamp nullable
- next_due_date date
- created_at, updated_at
```

#### GET `/recurring-expenses`
Retourne toutes les dépenses récurrentes actives

#### POST `/recurring-expenses`
```json
{
  "description": "Netflix",
  "amount": 15.99,
  "category_id": 3,
  "frequency": "monthly",
  "start_date": "2024-01-01",
  "end_date": null
}
```

#### PUT `/recurring-expenses/{id}`
Modifier une dépense récurrente

#### DELETE `/recurring-expenses/{id}`
Supprimer une dépense récurrente

#### POST `/recurring-expenses/{id}/toggle`
Activer/désactiver une dépense récurrente

#### POST `/recurring-expenses/generate`
Génère les dépenses dues (appelé quotidiennement par cron ou manuellement)

---

### 18. Revenus (NOUVEAU)

#### Table `incomes`
```sql
- id bigint
- user_id FK
- description string(100)
- amount decimal(12,2)
- source string(80)
- date date
- is_recurring boolean default false
- created_at, updated_at
```

#### GET `/incomes`
Query params: `date_from`, `date_to`, `source`, `page`, `per_page`

#### POST `/incomes`
```json
{
  "description": "Salaire",
  "amount": 2500,
  "source": "Emploi",
  "date": "2024-01-31",
  "is_recurring": true
}
```

#### PUT `/incomes/{id}`
#### DELETE `/incomes/{id}`

#### GET `/incomes/stats`
Retourne:
```json
{
  "total": 5000,
  "monthly_average": 2500,
  "by_source": [
    {"source": "Emploi", "total": 4500},
    {"source": "Freelance", "total": 500}
  ]
}
```

---

### 19. Notifications (NOUVEAU)

#### Table `notifications`
```sql
- id bigint
- user_id FK
- type enum('warning','info','success','error')
- title string(100)
- message text
- action string(50) nullable
- action_data json nullable
- is_read boolean default false
- created_at, updated_at
```

#### GET `/notifications`
Query: `is_read`, `type`, `page`, `per_page`

#### GET `/notifications/unread-count`
Retourne: `{"count": 5}`

#### POST `/notifications/{id}/read`
Marquer comme lu

#### POST `/notifications/read-all`
Marquer toutes comme lues

#### DELETE `/notifications/{id}`

---

### 20. Plafonds par catégorie (NOUVEAU)

#### Table `category_budgets`
```sql
- id bigint
- user_id FK
- category_id FK
- monthly_limit decimal(12,2)
- created_at, updated_at
- unique(user_id, category_id)
```

#### GET `/category-budgets`
Retourne tous les plafonds par catégorie

#### PUT `/category-budgets/{category_id}`
```json
{
  "monthly_limit": 200
}
```

#### GET `/category-budgets/status`
Retourne l'état actuel vs plafonds:
```json
{
  "categories": [
    {
      "category_id": 2,
      "category_name": "Transport",
      "limit": 200,
      "spent": 150,
      "remaining": 50,
      "percentage": 75
    }
  ]
}
```

---

### 21. Analytics avancés (NOUVEAU)

#### GET `/analytics/forecast`
Prévision du mois prochain basée sur l'historique
```json
{
  "next_month_prediction": 1250,
  "confidence": 0.85,
  "trend": "increasing",
  "recommendation": "Vos dépenses augmentent de 15%"
}
```

#### GET `/analytics/insights`
Insights automatiques
```json
{
  "insights": [
    {
      "type": "warning",
      "message": "Vous dépensez 30% plus en Transport ce mois-ci",
      "category": "Transport",
      "change_percentage": 30
    },
    {
      "type": "info",
      "message": "Votre meilleur jour pour économiser : Mardi",
      "data": {"day": "Tuesday", "avg_spending": 15}
    }
  ]
}
```

#### GET `/analytics/comparison`
Comparaisons avancées
```json
{
  "current_month": 1200,
  "previous_month": 1100,
  "same_month_last_year": 1050,
  "change_vs_previous": 9.09,
  "change_vs_last_year": 14.29,
  "moving_average_3m": 1150,
  "moving_average_6m": 1100
}
```

#### GET `/analytics/anomalies`
Détection d'anomalies
```json
{
  "anomalies": [
    {
      "expense_id": 123,
      "description": "Restaurant",
      "amount": 250,
      "date": "2024-01-15",
      "reason": "Montant inhabituel (moyenne: 50€)"
    }
  ]
}
```

---

### 22. Tags (NOUVEAU)

#### Table `tags`
```sql
- id bigint
- user_id FK
- name string(50)
- color string(7) nullable
- created_at, updated_at
- unique(user_id, name)
```

#### Table `expense_tags` (pivot)
```sql
- expense_id FK
- tag_id FK
- primary key(expense_id, tag_id)
```

#### GET `/tags`
#### POST `/tags`
```json
{
  "name": "vacances",
  "color": "#FF5733"
}
```

#### PUT `/tags/{id}`
#### DELETE `/tags/{id}`

#### POST `/expenses/{id}/tags`
```json
{
  "tag_ids": [1, 2, 3]
}
```

#### GET `/expenses?tags=1,2`
Filtrer par tags

---

### 23. Comptes multiples (NOUVEAU)

#### Table `accounts`
```sql
- id bigint
- user_id FK
- name string(80)
- type enum('checking','savings','cash','credit')
- balance decimal(12,2) default 0
- currency_code string(3) default 'EUR'
- is_active boolean default true
- created_at, updated_at
```

#### Table `transactions`
```sql
- id bigint
- user_id FK
- from_account_id FK nullable
- to_account_id FK nullable
- type enum('expense','income','transfer')
- amount decimal(12,2)
- description string(100)
- date date
- expense_id FK nullable
- income_id FK nullable
- created_at, updated_at
```

#### GET `/accounts`
#### POST `/accounts`
```json
{
  "name": "Compte courant",
  "type": "checking",
  "balance": 1000,
  "currency_code": "EUR"
}
```

#### PUT `/accounts/{id}`
#### DELETE `/accounts/{id}`

#### POST `/accounts/transfer`
```json
{
  "from_account_id": 1,
  "to_account_id": 2,
  "amount": 500,
  "description": "Épargne mensuelle"
}
```

#### GET `/accounts/{id}/transactions`
Historique des transactions d'un compte

---

### 24. Export PDF (NOUVEAU)

#### GET `/export/pdf`
Query params:
- `period`: `month|year|custom`
- `date_from`, `date_to`
- `include_charts`: `true|false`

Retourne un PDF avec:
- Résumé des dépenses
- Graphiques
- Statistiques par catégorie
- Comparaisons

---

### 25. Objectifs d'épargne étendus (EXTENSION)

#### Table `savings_goals`
```sql
- id bigint
- user_id FK
- name string(100)
- target_amount decimal(12,2)
- current_amount decimal(12,2) default 0
- deadline date nullable
- is_achieved boolean default false
- created_at, updated_at
```

#### GET `/savings-goals`
#### POST `/savings-goals`
```json
{
  "name": "Vacances 2024",
  "target_amount": 2000,
  "deadline": "2024-12-31"
}
```

#### PUT `/savings-goals/{id}`
#### DELETE `/savings-goals/{id}`

#### POST `/savings-goals/{id}/contribute`
```json
{
  "amount": 100
}
```

#### GET `/savings-goals/{id}/progress`
```json
{
  "goal": {
    "name": "Vacances 2024",
    "target_amount": 2000,
    "current_amount": 750,
    "percentage": 37.5,
    "remaining": 1250,
    "days_remaining": 180,
    "daily_required": 6.94
  }
}
```

---

### 26. Partage familial (NOUVEAU)

#### Table `shared_budgets`
```sql
- id bigint
- owner_id FK users
- name string(100)
- created_at, updated_at
```

#### Table `shared_budget_members`
```sql
- id bigint
- shared_budget_id FK
- user_id FK
- role enum('owner','editor','viewer')
- created_at, updated_at
```

#### POST `/shared-budgets`
```json
{
  "name": "Budget Famille"
}
```

#### POST `/shared-budgets/{id}/invite`
```json
{
  "user_id": 5,
  "role": "editor"
}
```

#### GET `/shared-budgets/{id}/expenses`
Dépenses partagées

#### POST `/shared-budgets/{id}/expenses`
Ajouter une dépense partagée

---

### 27. Historique et audit (NOUVEAU)

#### Table `audit_logs`
```sql
- id bigint
- user_id FK
- action string(50)
- entity_type string(50)
- entity_id bigint
- old_values json nullable
- new_values json nullable
- ip_address string(45)
- user_agent text
- created_at
```

#### GET `/audit-logs`
Query: `entity_type`, `entity_id`, `date_from`, `date_to`

#### POST `/expenses/{id}/revert`
Annuler une modification (restaure old_values)

---

### 28. Webhooks (NOUVEAU)

#### Table `webhooks`
```sql
- id bigint
- user_id FK
- url string(255)
- events json
- is_active boolean default true
- secret string(64)
- created_at, updated_at
```

#### POST `/webhooks`
```json
{
  "url": "https://example.com/webhook",
  "events": ["expense.created", "budget.exceeded"]
}
```

#### GET `/webhooks`
#### PUT `/webhooks/{id}`
#### DELETE `/webhooks/{id}`

Events disponibles:
- `expense.created`
- `expense.updated`
- `expense.deleted`
- `budget.exceeded`
- `recurring.generated`
- `goal.achieved`

---

## Résumé des nouvelles tables

1. `recurring_expenses`
2. `incomes`
3. `notifications`
4. `category_budgets`
5. `tags`
6. `expense_tags`
7. `accounts`
8. `transactions`
9. `savings_goals`
10. `shared_budgets`
11. `shared_budget_members`
12. `audit_logs`
13. `webhooks`

## Ordre d'implémentation recommandé (Phase 2)

1. Revenus + Dépenses récurrentes
2. Notifications
3. Plafonds par catégorie
4. Analytics avancés
5. Tags
6. Comptes multiples
7. Export PDF
8. Objectifs d'épargne étendus
9. Partage familial
10. Historique et audit
11. Webhooks

## Codes HTTP supplémentaires

- 429: Too Many Requests (rate limiting)
- 503: Service Unavailable (maintenance)
