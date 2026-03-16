<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Carteira;
use App\Models\TransacaoCarteira;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PagamentoController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'userId' => ['required', 'integer', 'exists:users,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['nullable', 'string', 'max:50'],
        ]);

        $result = DB::transaction(function () use ($data) {
            $carteira = Carteira::query()->where('user_id', $data['userId'])->lockForUpdate()->first();

            if (!$carteira) {
                return [
                    'error' => response()->json([
                        'status' => 'declined',
                        'message' => 'Carteira nao encontrada.',
                    ], 404),
                ];
            }

            $amount = round((float) $data['amount'], 2);
            $saldoAtual = round((float) $carteira->balance, 2);

            if ($saldoAtual < $amount) {
                return [
                    'error' => response()->json([
                        'status' => 'declined',
                        'message' => 'Saldo insuficiente.',
                    ], 422),
                ];
            }

            $carteira->balance = round($saldoAtual - $amount, 2);
            $carteira->save();

            $transacao = TransacaoCarteira::create([
                'wallet_id' => $carteira->id,
                'type' => 'debit',
                'amount' => $amount,
                'method' => $data['method'] ?? 'balance',
                'description' => 'Pagamento de sessao de estacionamento',
                'reference' => 'PAY-' . now()->format('YmdHis') . '-' . $carteira->id,
            ]);

            return [
                'payload' => response()->json([
                    'status' => 'approved',
                    'transactionId' => $transacao->id,
                    'balance' => $carteira->balance,
                    'message' => 'Pagamento aprovado.',
                ]),
            ];
        });

        return $result['error'] ?? $result['payload'];
    }
}