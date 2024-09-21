<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

/**
 * @test DocumentController GET /documents returns all documents with status 1 and group by priority
 */
test('indexJson returns grouped documents by priority', function () {

    $doc1 = Document::factory()->create([
        'status' => 1,
        'priority' => 1,
    ]);
    
    $doc2 = Document::factory()->create([
        'status' => 1,
        'priority' => 2,
    ]);
    
    $doc3 = Document::factory()->create([
        'status' => 1,
        'priority' => 3,
    ]);

    $response = $this->getJson(route('documents.Json'));

    $response->assertStatus(200)
        ->assertJsonStructure([
            'Prioridad Baja' => [
                '*' => ['id', 'name', 'date_submitted', 'date_approved', 'priority', 'detail']
            ],
            'Prioridad Media' => [
                '*' => ['id', 'name', 'date_submitted', 'date_approved', 'priority', 'detail']
            ],
            'Prioridad Alta' => [
                '*' => ['id', 'name', 'date_submitted', 'date_approved', 'priority', 'detail']
            ],
        ])
        ->assertJsonCount(1, 'Prioridad Baja')
        ->assertJsonCount(1, 'Prioridad Media')
        ->assertJsonCount(1, 'Prioridad Alta');

    $response->assertJsonFragment([
        'id' => $doc1->id,
        'detail' => route('documents.show', $doc1->id),
    ]);
    $response->assertJsonFragment([
        'id' => $doc2->id,
        'detail' => route('documents.show', $doc2->id),
    ]);
    $response->assertJsonFragment([
        'id' => $doc3->id,
        'detail' => route('documents.show', $doc3->id),
    ]);
});




/**
 * @test DocumentController GET /documents returns all active documents for users with permissions greater than 0
 */

test('documents returns all active documents for users with permissions greater than 0', function () {
    $user = User::factory()->create(['permissions' => 1]);

    $document1 = Document::factory()->create(['status' => 1]);
    $document2 = Document::factory()->create(['status' => 1]);

    Auth::login($user);

    $response = $this->getJson(route('documents.index'));

    $response->assertStatus(200)
        ->assertJsonFragment(['id' => $document1->id])
        ->assertJsonFragment(['id' => $document2->id]);
});

/**
 * @test DocumentController GET /documents returns only user documents when permissions is 0
 */

test('documents returns only user documents when permissions is 0', function () {
    $user = User::factory()->create(['permissions' => 0]);

    $userDocument = Document::factory()->create([
        'status' => 1,
        'user_id' => $user->id,
    ]);
    $otherDocument = Document::factory()->create([
        'status' => 1,
        'user_id' => User::factory(),
    ]);

    Auth::login($user);

    $response = $this->getJson(route('documents.index'));

    $response->assertStatus(200)
        ->assertJsonFragment(['id' => $userDocument->id])
        ->assertJsonMissing(['id' => $otherDocument->id]);
});


/**
 * @test DocumentController GET /documents/{id} returns the correct document
 */
test('showJson returns the correct document', function () {

    $document = Document::factory()->create();

    $response = $this->getJson(route('documents.show', $document->id));

    $response->assertStatus(200)
        ->assertJson([
            'id' => $document->id,
            'name' => $document->name,
            'description' => $document->description,
        ]);
});

/**
 * @test DocumentController GET /documents/{id} returns 404 if document not found
 */
test('showJson returns 404 if document not found', function () {
    $response = $this->getJson(route('documents.show', 999));

    $response->assertStatus(404);
});


/**
 * @test DocumentController GET /stats returns active documents and renders the Graficos view
 */

 test('stats returns active documents and renders the Graficos view', function () {

    $user = User::factory()->create(['permissions' => 2]);
    Auth::login($user);

    $activeDocument = Document::factory()->create(['status' => 1]);


    $response = $this->get(route('graficos'));

    $response->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Graficos') 
            ->has('documents', 1)
            ->where('documents.0.id', $activeDocument->id) 
        );
});

/**
 * @test DocumentController POST /documents stores a document and returns it
 */
test('store creates a document and returns it', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    Auth::login($user);

    $data = [
        'name' => 'Test Document',
        'description' => 'This is a test document.',
        'priority' => 1,
        'document' => UploadedFile::fake()->create('document.pdf', 100), 
        'user_id' => $user->id,
    ];

    $response = $this->actingAs($user)->post(route('documents.store'), $data);

    $response->assertStatus(201)
        ->assertJsonStructure(['id', 'name', 'description', 'priority', 'date_approved', 'date_submitted', 'url', 'user_id']);

    $this->assertDatabaseHas('documents', [
        'name' => 'Test Document',
        'description' => 'This is a test document.',
        'priority' => 1,
        'user_id' => $user->id,
    ]);
});

/**
 * @test DocumentController POST /documents returns validation errors for invalid data
 */
test('store returns validation errors for invalid data', function () {
    $user = User::factory()->create();
    Auth::login($user);

    $data = [
        'description' => 'This is a test document.',
        'priority' => 1,
        'document' => UploadedFile::fake()->create('document.pdf', 100),
        'user_id' => 1,
    ];

    $response = $this->post(route('documents.store'), $data);

    $response->assertStatus(422)
        ->assertJsonStructure(['errors' => ['name']]);
});

/**
 * @test DocumentController POST /documents/{id} updates the document and returns it
 */
test('update returns validation errors for invalid data', function () {
    $document = Document::factory()->create();
    $user = User::factory()->create();
    Auth::login($user);

    $data = [
        'description' => 'Updated description.',
        'priority' => 4,
        'user_id' => $document->user_id,
        'date_submitted' => now(),
        'date_approved' => null,
    ];

    $response = $this->post(route('documents.update', $document->id), $data);

    $response->assertStatus(422)
        ->assertJsonStructure(['errors' => ['priority']]);
});

/**
 * @test DocumentController DELETE /documents/{id} updates the document and returns it
 */
test('destroy marks the document as deleted', function () {
    $document = Document::factory()->create(['status' => 1]);
    $user = User::factory()->create();
    Auth::login($user);

    $response = $this->delete(route('documents.destroy', $document->id));

    $response->assertStatus(200)
        ->assertJsonStructure(['id', 'name', 'description', 'priority', 'date_submitted', 'date_approved', 'url', 'status', 'user_id']) 
        ->assertJson(['status' => 0]); 
    $this->assertDatabaseHas('documents', [
        'id' => $document->id,
        'status' => 0,
    ]);
});

/**
 * @test DocumentController PUT /documents/{id} approves the document
 */
test('approve sets the document status to approved', function () {
    $document = Document::factory()->create(['status' => 0]); 
    $user = User::factory()->create();
    Auth::login($user); 

    $response = $this->patch(route('documents.approve', $document->id));

    $response->assertStatus(200)
        ->assertJsonStructure(['id', 'name', 'description', 'priority', 'date_submitted', 'date_approved', 'url', 'status', 'user_id'])
        ->assertJson(['status' => 1]); 

    $this->assertDatabaseHas('documents', [
        'id' => $document->id,
        'status' => 1,
        'date_approved' => now()->format('Y-m-d H:i:s'),
    ]);
});
