# OnPark Laravel API

Este repositorio contem o front-end em React Native. Como `php` e `composer` nao estao instalados nesta maquina, o back-end foi preparado como um template em `backend-laravel-template/` para ser copiado para um projeto Laravel novo.

## 1. Instalar dependencias no Windows

Voce precisa ter:

- PHP 8.2 ou superior
- Composer
- MySQL 8 ou MariaDB

Se quiser validar depois:

```powershell
php -v
composer --version
mysql --version
```

## 2. Criar o projeto Laravel

```powershell
cd C:\Users\gusta\Downloads\App_Dsin_Projct
composer create-project laravel/laravel onpark-api
cd onpark-api
php artisan install:api
```

Agora copie os arquivos da pasta `backend-laravel-template/` deste repositorio para dentro do projeto Laravel recem-criado, preservando a estrutura de pastas. Os modelos e controladores do template usam nomes em portugues.

## 3. Criar o banco de dados MySQL

Entre no MySQL:

```sql
mysql -u root -p
```

Crie o banco e um usuario dedicado:

```sql
CREATE DATABASE onpark_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'onpark_user'@'localhost' IDENTIFIED BY 'SenhaForte123!';
GRANT ALL PRIVILEGES ON onpark_api.* TO 'onpark_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 4. Configurar o `.env`

No projeto Laravel, ajuste estas chaves:

```env
APP_NAME=OnParkAPI
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=onpark_api
DB_USERNAME=onpark_user
DB_PASSWORD=SenhaForte123!
```

Depois rode:

```powershell
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

## 5. Endpoints entregues

Os endpoints abaixo foram alinhados com o que o app ja consome:

- `POST /api/Auth/login`
- `GET /api/Usuario`
- `GET /api/Usuario/{id}`
- `POST /api/Usuario`
- `GET /api/Veiculo`
- `POST /api/Veiculo`
- `PUT /api/Veiculo/{id}`
- `DELETE /api/Veiculo/{id}`
- `GET /api/Vaga`
- `POST /api/Vaga`
- `PUT /api/Vaga/{id}`
- `DELETE /api/Vaga/{id}`
- `GET /api/Ticket`
- `POST /api/Ticket`
- `PUT /api/Ticket/{id}`
- `DELETE /api/Ticket/{id}`
- `GET /api/wallet/{userId}`
- `POST /api/wallet`
- `PUT /api/wallet/{userId}`
- `POST /api/payments`
- `GET /api/health`

## 6. Seed inicial

O seeder cria:

- 1 usuario demo: `demo@onpark.com`
- senha: `123456`
- carteira inicial com `150.00`
- 1 veiculo
- 3 vagas

## 7. Ajuste no app mobile

Quando a API estiver rodando, troque as bases no front-end para o IP da sua maquina, por exemplo:

- `http://192.168.0.10:8000` para o back-end Laravel
- `http://192.168.0.10:8000/api` para endpoints da carteira e pagamento, se voce quiser padronizar

Se estiver usando emulador Android, normalmente `10.0.2.2` aponta para o host local.

## 8. Alternativa com SQLite

Se quiser subir rapido sem MySQL:

```powershell
New-Item -ItemType File -Path .\database\database.sqlite
```

No `.env`:

```env
DB_CONNECTION=sqlite
DB_DATABASE=C:/caminho/completo/para/onpark-api/database/database.sqlite
```

Depois:

```powershell
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

## 9. Script SQL direto para SQLite

Se voce quiser montar o banco SQLite manualmente sem usar migrations, foi adicionado um script completo em `backend-laravel-template/database/sqlite/onpark_sqlite.sql`.

Crie o arquivo do banco:

```powershell
New-Item -ItemType File -Path .\database\database.sqlite -Force
```

Se tiver o `sqlite3` instalado, importe assim:

```powershell
sqlite3 .\database\database.sqlite ".read C:/Users/gusta/Downloads/App_Dsin_Projct/App_Dsin_Projct/backend-laravel-template/database/sqlite/onpark_sqlite.sql"
```

Importante: use ou o script SQL direto, ou `php artisan migrate`. Nao rode os dois sobre o mesmo banco vazio esperando o mesmo resultado, porque ambos criam as mesmas tabelas.