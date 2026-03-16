<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vaga;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VagaController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Vaga::query()->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:255'],
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
            'ativa' => ['nullable', 'boolean'],
        ]);

        $vaga = Vaga::create([
            ...$data,
            'ativa' => $data['ativa'] ?? true,
        ]);

        return response()->json($vaga, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $vaga = Vaga::findOrFail($id);

        $data = $request->validate([
            'titulo' => ['sometimes', 'string', 'max:255'],
            'descricao' => ['nullable', 'string', 'max:255'],
            'latitude' => ['sometimes', 'numeric'],
            'longitude' => ['sometimes', 'numeric'],
            'ativa' => ['nullable', 'boolean'],
        ]);

        $vaga->update($data);

        return response()->json($vaga->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $vaga = Vaga::findOrFail($id);
        $vaga->delete();

        return response()->json([
            'message' => 'Vaga removida com sucesso.',
        ]);
    }
}