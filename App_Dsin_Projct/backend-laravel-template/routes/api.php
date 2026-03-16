<?php

use App\Http\Controllers\Api\AutenticacaoController;
use App\Http\Controllers\Api\CarteiraController;
use App\Http\Controllers\Api\PagamentoController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\VagaController;
use App\Http\Controllers\Api\VeiculoController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'onpark-api',
    ]);
});

Route::post('/Auth/login', [AutenticacaoController::class, 'login']);

Route::get('/Usuario', [UsuarioController::class, 'index']);
Route::get('/Usuario/{id}', [UsuarioController::class, 'show']);
Route::post('/Usuario', [UsuarioController::class, 'store']);

Route::get('/Veiculo', [VeiculoController::class, 'index']);
Route::post('/Veiculo', [VeiculoController::class, 'store']);
Route::put('/Veiculo/{id}', [VeiculoController::class, 'update']);
Route::delete('/Veiculo/{id}', [VeiculoController::class, 'destroy']);

Route::get('/Vaga', [VagaController::class, 'index']);
Route::post('/Vaga', [VagaController::class, 'store']);
Route::put('/Vaga/{id}', [VagaController::class, 'update']);
Route::delete('/Vaga/{id}', [VagaController::class, 'destroy']);

Route::get('/Ticket', [TicketController::class, 'index']);
Route::post('/Ticket', [TicketController::class, 'store']);
Route::put('/Ticket/{id}', [TicketController::class, 'update']);
Route::delete('/Ticket/{id}', [TicketController::class, 'destroy']);

Route::get('/wallet/{userId}', [CarteiraController::class, 'show']);
Route::post('/wallet', [CarteiraController::class, 'store']);
Route::put('/wallet/{userId}', [CarteiraController::class, 'update']);

Route::post('/payments', [PagamentoController::class, 'store']);