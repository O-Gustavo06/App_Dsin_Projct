<?php

namespace Database\Seeders;

use App\Models\Carteira;
use App\Models\Vaga;
use App\Models\User;
use App\Models\Veiculo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'demo@onpark.com'],
            [
                'name' => 'Usuario Demo',
                'password' => Hash::make('123456'),
            ]
        );

        Carteira::query()->updateOrCreate(
            ['user_id' => $user->id],
            ['balance' => 150.00]
        );

        Veiculo::query()->updateOrCreate(
            ['placa' => 'ABC1D23'],
            [
                'user_id' => $user->id,
                'modelo' => 'Gol 1.0',
                'cor' => 'Prata',
            ]
        );

        $spots = [
            [
                'titulo' => 'Vaga Quadra Unimar',
                'descricao' => 'Vaga disponivel',
                'latitude' => -22.2328,
                'longitude' => -49.9762,
                'ativa' => true,
            ],
            [
                'titulo' => 'Vaga Refeitorio',
                'descricao' => 'Vaga disponivel',
                'latitude' => -22.2336,
                'longitude' => -49.9770,
                'ativa' => true,
            ],
            [
                'titulo' => 'Vaga Campo Futebol',
                'descricao' => 'Vaga disponivel',
                'latitude' => -22.2340,
                'longitude' => -49.9768,
                'ativa' => true,
            ],
        ];

        foreach ($spots as $spot) {
            Vaga::query()->updateOrCreate(
                ['titulo' => $spot['titulo']],
                $spot
            );
        }
    }
}