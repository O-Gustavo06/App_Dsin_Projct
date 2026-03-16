# Backend Laravel Template

Este diretorio contem os arquivos especificos da API do OnPark. Ele foi pensado para ser copiado para um projeto Laravel novo apos executar:

```powershell
composer create-project laravel/laravel onpark-api
cd onpark-api
php artisan install:api
```

Depois copie as pastas `app/`, `database/` e `routes/` deste template para o projeto criado.

## Recursos incluidos

- Autenticacao por email e senha
- Cadastro de usuarios
- CRUD de veiculos
- CRUD de vagas
- CRUD de tickets
- Carteira digital
- Pagamento de sessao por saldo
- Seeder com dados iniciais

## Observacoes

- As rotas foram mantidas com nomes que o app React Native ja usa, inclusive `Usuario`, `Veiculo`, `Vaga` e `Ticket`.
- Os arquivos e classes do template foram nomeados em portugues para ficar coerente com o dominio do projeto.
- O template evita middleware obrigatorio de autenticacao para facilitar a primeira integracao com o front-end atual.
- Se quiser endurecer a seguranca depois, aplique `auth:sanctum` nas rotas de escrita.