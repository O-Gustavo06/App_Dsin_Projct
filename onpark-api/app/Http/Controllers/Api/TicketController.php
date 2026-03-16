<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Ticket::query()->latest();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'vehicle_id' => ['nullable', 'integer', 'exists:vehicles,id'],
            'parking_spot_id' => ['nullable', 'integer', 'exists:parking_spots,id'],
            'started_at' => ['nullable', 'date'],
            'ended_at' => ['nullable', 'date'],
            'minutes_used' => ['nullable', 'integer', 'min:0'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:open,closed,cancelled'],
        ]);

        $ticket = Ticket::create([
            ...$data,
            'started_at' => $data['started_at'] ?? now(),
            'minutes_used' => $data['minutes_used'] ?? 0,
            'amount' => $data['amount'] ?? 0,
            'status' => $data['status'] ?? 'open',
        ]);

        return response()->json($ticket, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        $data = $request->validate([
            'vehicle_id' => ['nullable', 'integer', 'exists:vehicles,id'],
            'parking_spot_id' => ['nullable', 'integer', 'exists:parking_spots,id'],
            'started_at' => ['nullable', 'date'],
            'ended_at' => ['nullable', 'date'],
            'minutes_used' => ['nullable', 'integer', 'min:0'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:open,closed,cancelled'],
        ]);

        $ticket->update($data);

        return response()->json($ticket->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->delete();

        return response()->json([
            'message' => 'Ticket removido com sucesso.',
        ]);
    }
}