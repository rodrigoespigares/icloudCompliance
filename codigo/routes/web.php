<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [AuthenticatedSessionController::class, 'create'])->name('landing');

Route::get('/home', function (){
    $user = Auth::user();
    $permissions = match ($user->permissions) {
        2 => ["can_see", "can_create", "can_edit", "can_delete", "can_approve"],
        1 => ["can_see", "can_create", "can_approve"],
        0 => ["can_see"],
        default => [],
    };
    return Inertia::render('Dashboard', [
        'permissions' => $permissions
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');
Route::get('/graficos', [DocumentController::class, "stats"])->middleware(['auth', 'verified'])->name('graficos');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/documents', [DocumentController::class, 'documents']);
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::post('/documents/{id}', [DocumentController::class, 'update'])->name('documents.update');
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy'])->name('documents.destroy');
    Route::patch('/documents/{id}', [DocumentController::class, 'approve'])->name('documents.approve');



    Route::get('/users', [UserController::class, 'index']);
});

require __DIR__.'/auth.php';
