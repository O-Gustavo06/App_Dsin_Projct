<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carteira;
use App\Models\TransacaoCarteira;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarteiraController extends Controller
{
    public function show(int $userId): JsonResponse
    {
        $carteira = Carteira::query()->where('user_id', $userId)->first();

        if (!$carteira) {
            return response()->json([
                'message' => 'Carteira nao encontrada.',
            ], 404);
        }

        return response()->json($carteira);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'userId' => ['required', 'integer', 'exists:users,id'],
            'balance' => ['required', 'numeric', 'min:0'],
        ]);

        User::findOrFail($data['userId']);

        $carteiraExistente = Carteira::query()->where('user_id', $data['userId'])->first();
        $saldoAnterior = $carteiraExistente ? (float) $carteiraExistente->balance : 0.0;

        $carteira = Carteira::updateOrCreate(
            ['user_id' => $data['userId']],
            ['balance' => $data['balance']]
        );

        $delta = round(((float) $data['balance']) - $saldoAnterior, 2);

        if ($delta > 0) {
            TransacaoCarteira::create([
                'wallet_id' => $carteira->id,
                'type' => 'credit',
                'amount' => $delta,
                'method' => 'manual',
                'description' => 'Criacao ou recarga inicial da carteira',
            ]);
        }

        return response()->json($carteira, 201);
    }

    public function update(Request $request, int $userId): JsonResponse
    {
        $data = $request->validate([
            'balance' => ['required', 'numeric', 'min:0'],
        ]);

        User::findOrFail($userId);

        $carteiraExistente = Carteira::query()->where('user_id', $userId)->first();
        $saldoAnterior = $carteiraExistente ? (float) $carteiraExistente->balance : 0.0;

        $carteira = Carteira::updateOrCreate(
            ['user_id' => $userId],
            ['balance' => $data['balance']]
        );

        $novoSaldo = (float) $data['balance'];
        $delta = round($novoSaldo - $saldoAnterior, 2);

        if ($delta !== 0.0) {
            TransacaoCarteira::create([
                'wallet_id' => $carteira->id,
                'type' => $delta > 0 ? 'credit' : 'debit',
                'amount' => abs($delta),
                'method' => 'manual',
                'description' => 'Ajuste manual de saldo da carteira',
            ]);
        }

        return response()->json($carteira);
    }
}