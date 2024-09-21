<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'description' => $this->faker->sentence,
            'priority' => $this->faker->numberBetween(1, 3),
            'date_submitted' => $this->faker->date,
            'date_approved' => $this->faker->optional()->date,
            'status' => 1,
            'url' => $this->faker->url,
            'user_id' => User::factory(), 
        ];
    }
}
