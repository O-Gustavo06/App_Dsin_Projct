<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Veiculo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VeiculoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Veiculo::query()->latest();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'placa' => ['required', 'string', 'max:12', 'unique:vehicles,placa'],
            'modelo' => ['required', 'string', 'max:255'],
            'cor' => ['nullable', 'string', 'max:120'],
        ]);

        $vehicle = Veiculo::create($data);

        return response()->json($vehicle, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $vehicle = Veiculo::findOrFail($id);

        $data = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'placa' => ['sometimes', 'string', 'max:12', 'unique:vehicles,placa,' . $vehicle->id],
            'modelo' => ['sometimes', 'string', 'max:255'],
            'cor' => ['nullable', 'string', 'max:120'],
        ]);

        $vehicle->update($data);

        return response()->json($vehicle->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $vehicle = Veiculo::findOrFail($id);
        $vehicle->delete();

        return response()->json([
            'message' => 'Veiculo removido com sucesso.',
        ]);
    }
}