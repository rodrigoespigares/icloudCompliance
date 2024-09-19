<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class createUsers extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@icloud.com',
            'password' => Hash::make('admin'),
            'permissions' => 2,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        User::create([
            'name' => 'Manager',
            'email' => 'manager@icloud.com',
            'password' => Hash::make('manager'),
            'permissions' => 1,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        User::create([
            'name' => 'Assigned',
            'email' => 'assigned@icloud.com',
            'password' => Hash::make('assigned'),
            'permissions' => 0,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
