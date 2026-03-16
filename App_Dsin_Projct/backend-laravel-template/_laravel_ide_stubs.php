<?php

namespace Illuminate\Database\Eloquent\Factories;

trait HasFactory
{
}

namespace Illuminate\Database\Eloquent;

class Builder
{
    public function where(string $column, mixed $operator = null, mixed $value = null): static
    {
        return $this;
    }

    public function select(array $columns = ['*']): static
    {
        return $this;
    }

    public function latest(): static
    {
        return $this;
    }

    public function lockForUpdate(): static
    {
        return $this;
    }

    public function get(): array
    {
        return [];
    }

    public function first(): ?Model
    {
        return null;
    }

    public function findOrFail(int|string $id): Model
    {
        return new Model();
    }

    public function updateOrCreate(array $attributes, array $values = []): Model
    {
        return new Model();
    }

    public function firstOrCreate(array $attributes, array $values = []): Model
    {
        return new Model();
    }
}

class Model
{
    public int|string $id;

    public static function query(): Builder
    {
        return new Builder();
    }

    public static function create(array $attributes = []): static
    {
        return new static();
    }

    public static function findOrFail(int|string $id): static
    {
        return new static();
    }

    public static function updateOrCreate(array $attributes, array $values = []): static
    {
        return new static();
    }

    public static function firstOrCreate(array $attributes, array $values = []): static
    {
        return new static();
    }

    public function update(array $attributes = []): bool
    {
        return true;
    }

    public function delete(): bool
    {
        return true;
    }

    public function save(): bool
    {
        return true;
    }

    public function fresh(): static
    {
        return $this;
    }
}

namespace Illuminate\Foundation\Auth;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
}

namespace Illuminate\Http;

class Request
{
    public function validate(array $rules): array
    {
        return [];
    }

    public function filled(string $key): bool
    {
        return false;
    }

    public function integer(string $key): int
    {
        return 0;
    }
}

class JsonResponse
{
}

namespace Illuminate\Support\Facades;

class Route
{
    public static function get(string $uri, mixed $action): void
    {
    }

    public static function post(string $uri, mixed $action): void
    {
    }

    public static function put(string $uri, mixed $action): void
    {
    }

    public static function delete(string $uri, mixed $action): void
    {
    }
}

class Hash
{
    public static function make(string $value): string
    {
        return $value;
    }

    public static function check(string $value, string $hashedValue): bool
    {
        return true;
    }
}

class DB
{
    public static function transaction(callable $callback): mixed
    {
        return $callback();
    }
}

class Schema
{
    public static function create(string $table, callable $callback): void
    {
    }

    public static function dropIfExists(string $table): void
    {
    }
}

namespace Illuminate\Database\Migrations;

abstract class Migration
{
}

namespace Illuminate\Database;

class Seeder
{
    public function run(): void
    {
    }
}

namespace Illuminate\Database\Schema;

class Blueprint
{
    public function id(): void
    {
    }

    public function foreignId(string $column): static
    {
        return $this;
    }

    public function constrained(?string $table = null): static
    {
        return $this;
    }

    public function nullOnDelete(): static
    {
        return $this;
    }

    public function cascadeOnDelete(): static
    {
        return $this;
    }

    public function string(string $column, ?int $length = null): static
    {
        return $this;
    }

    public function decimal(string $column, int $total = 8, int $places = 2): static
    {
        return $this;
    }

    public function boolean(string $column): static
    {
        return $this;
    }

    public function timestamp(string $column): static
    {
        return $this;
    }

    public function unsignedInteger(string $column): static
    {
        return $this;
    }

    public function unique(): static
    {
        return $this;
    }

    public function nullable(): static
    {
        return $this;
    }

    public function default(mixed $value): static
    {
        return $this;
    }

    public function timestamps(): void
    {
    }
}

namespace {

    class _ResponseFactory
    {
        public function json(mixed $data = null, int $status = 200): \Illuminate\Http\JsonResponse
        {
            return new \Illuminate\Http\JsonResponse();
        }
    }

    function response(): _ResponseFactory
    {
        return new _ResponseFactory();
    }

    function now(): object
    {
        return new class {
            public function format(string $format): string
            {
                return date($format);
            }
        };
    }
}