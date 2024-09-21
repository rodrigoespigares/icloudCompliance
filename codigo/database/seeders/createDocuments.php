<?php

namespace Database\Seeders;

use DateTime;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class createDocuments extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Storage::makeDirectory('private/documents');

        $document1 = UploadedFile::fake()->create('document1.pdf', 100);
        $document2 = UploadedFile::fake()->create('document2.pdf', 100);
        $document3 = UploadedFile::fake()->create('document3.pdf', 100);
        $document4 = UploadedFile::fake()->create('document4.pdf', 100);

        $url1 = Storage::putFile('documents', $document1);
        $url2 = Storage::putFile('documents', $document2);
        $url3 = Storage::putFile('documents', $document3);
        $url4 = Storage::putFile('documents', $document4);

        DB::table('documents')->insert([
            [
                'name' => 'Documento 1',
                'description' => 'Descripción del documento 1',
                'priority' => 1,
                'date_approved' => now(),
                'date_submitted' => now(),
                'url' => $url1,
                'status' => 1,
                'user_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Documento 2',
                'description' => 'Descripción del documento 2',
                'priority' => 2,
                'date_approved' => null,
                'date_submitted' => now(),
                'url' => $url2,
                'status' => 1,
                'user_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Documento 3',
                'description' => 'Descripción del documento 3',
                'priority' => 3,
                'date_approved' => new DateTime('2024-01-01'),
                'date_submitted' => now(),
                'url' => $url3,
                'status' => 1,
                'user_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Documento 4',
                'description' => 'Descripción del documento 4',
                'priority' => 3,
                'date_approved' => new DateTime('2024-05-01'),
                'date_submitted' => now(),
                'url' => $url4,
                'status' => 1,
                'user_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
