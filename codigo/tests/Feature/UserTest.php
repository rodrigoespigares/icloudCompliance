<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;

/**
 * @test UserController GET /users returns all users
 */
test('index returns all users', function () {
    User::factory()->count(3)->create();

    $user = User::factory()->create();
    Auth::login($user);

   
    $response = $this->get('/users');

    $response->assertStatus(200)
        ->assertJsonStructure([
            '*' => ['id', 'name', 'email', 'created_at', 'updated_at'], 
        ])
        ->assertJsonCount(4);
});
