# mini-notion

Небольшой full-stack MVP «заметок в стиле Notion»: воркспейсы, древо страниц, простой редактор текста, поиск по заголовку и содержимому, JWT-аутентификация. Цель репозитория — рабочий сквозной пример (Express + Prisma + React), а не production SaaS.

## Стек

- **Backend:** Node.js 20+, TypeScript, Express, Prisma (PostgreSQL), Zod, JWT (jsonwebtoken), bcryptjs, Vitest + supertest.
- **Frontend:** React 19, TypeScript, Vite, React Router 7, TanStack Query v5, React Hook Form + Zod, Tailwind CSS, Vitest + Testing Library.

## Ключевые фичи (MVP)

- Регистрация и вход; защищённые маршруты; выход.
- Список воркспейсов пользователя; выбор активного воркспейса.
- Дерево страниц; создание корневой и дочерней страницы.
- Редактор: заголовок и текст (textarea); сохранение через PATCH; архивирование.
- Глобальный поиск страниц (запрос к API, debounce на клиенте).

## Архитектура

Монорепозиторий на npm **workspaces**: пакеты `client` и `server` в одном корне.

- **server** — REST API под префиксом `/api`, доступ к БД только через Prisma, валидация входа Zod.
- **client** — SPA на Vite; в dev режиме запросы `/api` проксируются на backend (см. `client/vite.config.ts`). Для production можно задать `VITE_API_URL` с абсолютным origin API.

Слои на фронте (условно): `entities` (типы), ` features` (API + ключи запросов), `widgets` (композиция UI), `pages` (экраны), `app` (маршруты, layout, провайдеры).

## Структура папок (сжато)

```text
mini-notion/
├── client/                 # React SPA
│   ├── src/
│   │   ├── app/            # routes, layout, protected/public routes
│   │   ├── pages/          # login, register, dashboard, editor, 404
│   │   ├── widgets/        # sidebar, search bar, page tree
│   │   ├── features/       # auth, workspaces, pages (api, query keys)
│   │   ├── entities/       # shared DTO-oriented types
│   │   └── shared/         # http client, query client, token storage, utils
│   ├── test/               # render helpers, fetch mocks, setup
│   └── vite.config.ts      # aliases, /api proxy
├── server/                 # Express API
│   ├── src/                # modules (auth, workspaces, pages, ...)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── test/               # unit + integration (Vitest)
│   └── docker/             # init script для тестовой БД
├── docker-compose.yml      # PostgreSQL 16
└── package.json            # workspaces + общие скрипты
```

## Инициализация с нуля

Требования: **Node.js 20+**, **Docker** (для PostgreSQL), **npm** (входит в Node).

1. Клонировать репозиторий и перейти в каталог проекта.

2. Установить зависимости всех workspace-пакетов из корня:

   ```bash
   npm install
   ```

3. Поднять PostgreSQL:

   ```bash
   npm run docker:up
   ```

   Первый запуск создаёт БД `mini_notion` и тестовую `mini_notion_test` (см. `server/docker/init-test-db.sql`). Дождитесь готовности контейнера (`healthy` в `docker compose ps`).

4. Переменные окружения **server** — скопировать пример и при необходимости поправить:

   ```bash
   copy server\.env.example server\.env
   ```

   На Unix/macOS: `cp server/.env.example server/.env`.

   Ключевое поле: `DATABASE_URL` (в примере совпадает с `docker-compose.yml`).

5. Переменные **client** (опционально в dev: можно не задавать — используется относительный `/api` и прокси Vite):

   ```bash
   copy client\.env.example client\.env
   ```

   Если задать `VITE_API_URL`, запросы пойдут на этот origin (нужно для preview/production за другим хостом/портом).

6. Prisma — из каталога `server` (или через `-w server` из корня):

   ```bash
   npm run prisma:generate -w server
   npm run prisma:migrate -w server
   ```

   `prisma migrate dev` применит миграции из `server/prisma/migrations` к БД из `DATABASE_URL`. Для чистого деплоя без dev-режима обычно используют `npm run db:migrate:deploy -w server`.

## Запуск PostgreSQL (docker compose)

Из корня репозитория:

```bash
docker compose up -d
```

Остановка:

```bash
npm run docker:down
```

Порты и учётные данные — в `docker-compose.yml` (по умолчанию пользователь/пароль `mini_notion`, порт `5432`).

## Запуск backend

В одном терминале (из корня):

```bash
npm run dev:server
```

API по умолчанию слушает порт из `server/.env` (`PORT=3001` в примере).

## Запуск frontend

В другом терминале:

```bash
npm run dev:client
```

Vite: **http://localhost:5173**, прокси `/api` → `http://localhost:3001`.

## Переменные окружения

| Файл | Назначение |
|------|------------|
| `server/.env` | `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` — см. `server/.env.example`. |
| `server/.env.test` | Для integration-тестов: скопировать из `server/.env.test.example`, убедиться, что PostgreSQL запущен и доступен `DATABASE_URL` (часто `mini_notion_test`). |
| `client/.env` | Опционально `VITE_API_URL` — см. `client/.env.example`. |

## Тесты backend

С тестовой БД и `server/.env.test`:

```bash
npm run test -w server
```

Только unit или integration:

```bash
npm run test:unit -w server
npm run test:integration -w server
```

## Тесты frontend

```bash
npm run test -w client
```

Покрыты компонентным/интеграционным стилем сценарии с **мокнутым `fetch`** (аутентификация, защищённые маршруты, сайдбар, редактор, поиск). Такой уровень ближе к тому, как приложение ведёт себя с React Query и роутером, без поднятия реального API.

## Запуск проекта целиком (локальная разработка)

1. `npm run docker:up`
2. Настроить `server/.env`, выполнить `npm run prisma:generate -w server` и `npm run prisma:migrate -w server` (один раз или после смены схемы).
3. `npm run dev:server`
4. `npm run dev:client`
5. Открыть **http://localhost:5173** — зарегистрироваться или войти.

Сборка:

```bash
npm run build
```

## Ограничения MVP

- Контент страницы — plain text (textarea), без богатого форматирования и совместного редактирования.
- Нет ролей и шаринга воркспейсов между пользователями (модель заточена под владельца).
- Поиск и дерево рассчитаны на умеренный объём данных; пагинация и индексация full-text на уровне БД — минимальные.
- UX и визуальный дизайн намеренно простые.

## Roadmap (возможные улучшения)

- Rich text (например ProseMirror/TipTap) и блочная модель.
- Полноценный full-text search в PostgreSQL, подсветка совпадений.
- Совместный доступ, роли, иерархия прав.
- WebSockets или SSE для живых обновлений.
- E2E (Playwright) с поднятыми server + client.
- Docker-образ приложения и CI (lint, test, migrate).
