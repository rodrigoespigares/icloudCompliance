<?php

use App\Http\Controllers\DocumentController;
use Illuminate\Support\Facades\Route;


Route::get('documents', [DocumentController::class, 'indexJson'])->name('documents.Json'); 
Route::get('documents/{id}', [DocumentController::class, 'showJson'])->name('documents.show');