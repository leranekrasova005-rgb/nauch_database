# Система модерации работ методистов

## Структура проекта

- `frontend/` - React приложение (Vite)
- `backend/` - Django REST API

## Быстрый старт с Docker

### 1. Клонирование репозитория

```bash
git clone <URL_РЕПОЗИТОРИЯ>
cd <ПАПКА_ПРОЕКТА>
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

При необходимости измените значения в `.env`.

### 3. Запуск через Docker Compose

```bash
docker-compose up --build
```

После запуска:
- Фронтенд доступен по адресу: http://localhost:5173
- Бэкенд API доступен по адресу: http://localhost:8000/api
- Django Admin панель: http://localhost:8000/admin

### 4. Создание суперпользователя

```bash
docker-compose exec backend python manage.py createsuperuser
```

## Локальная разработка (без Docker)

### Фронтенд

```bash
cd frontend
npm install
npm run dev
```

Фронтенд будет доступен на http://localhost:5173

### Бэкенд

```bash
cd backend
python -m venv venv
source venv/bin/activate  # или venv\Scripts\activate на Windows
pip install -r requirements.txt

# Для разработки можно использовать SQLite
export USE_SQLITE=True
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Бэкенд будет доступен на http://localhost:8000

## Тестовые учетные данные

После создания пользователей через админку или API:

- Методист: логин/пароль, которые вы создали
- Администратор: логин/пароль, которые вы создали

## API Endpoints

### Аутентификация
- `POST /api/auth/login/` - получение токенов
- `POST /api/auth/refresh/` - обновление токена
- `GET /api/auth/me/` - информация о текущем пользователе

### Работы (для методистов)
- `GET /api/works/` - список своих работ
- `POST /api/works/` - создание новой работы
- `GET /api/works/{id}/` - детальная информация
- `PUT/PATCH /api/works/{id}/` - редактирование
- `DELETE /api/works/{id}/` - удаление

### Работы (для админов)
- `GET /api/admin/works/` - все работы
- `GET /api/admin/works/?status=PENDING` - только на модерации
- `POST /api/admin/works/{id}/approve/` - одобрить
- `POST /api/admin/works/{id}/reject/` - отклонить

## Статусы работ

- `PENDING` - На модерации
- `APPROVED` - Одобрено
- `REJECTED` - Отклонено

##Workflow модерации

1. Методист создает работу → статус автоматически устанавливается в `PENDING`
2. Администратор видит работу в разделе "На модерации"
3. Администратор одобряет или отклоняет работу:
   - При одобрении статус меняется на `APPROVED`, работа появляется в публичном доступе
   - При отклонении статус меняется на `REJECTED`, указывается причина
4. Методист видит статус своей работы в личном кабинете
