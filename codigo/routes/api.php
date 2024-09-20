<?php

use App\Http\Controllers\DocumentController;
use Illuminate\Support\Facades\Route;


Route::get('documents', [DocumentController::class, 'indexJson']); 
Route::get('documents/{id}', [DocumentController::class, 'showJson'])->name('documents.show');