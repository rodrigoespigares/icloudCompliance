<?php

namespace Database\Seeders;

use DateTime;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class createDocuments extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('documents')->insert([
            [
                'name' => 'Documento 1',
                'description' => 'Descripción del documento 1',
                'priority' => 1,
                'date_approved' => now(),
                'date_submitted' => now(),
                'url' => '',
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
                'url' => '',
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
                'url' => '',
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
                'url' => '',
                'status' => 1,
                'user_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
