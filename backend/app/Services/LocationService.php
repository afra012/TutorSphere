<?php

namespace App\Services;

use App\Models\Location;
use Illuminate\Support\Facades\DB;

class LocationService
{
    public function create(
        int $userId,
        float $latitude,
        float $longitude,
        string $address
    ): Location {
        return DB::transaction(function () use (
            $userId,
            $latitude,
            $longitude,
            $address
        ) {
            return Location::create([
                'user_id' => $userId,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'address' => $address,
            ]);
        });
    }

    public function update(
        Location $location,
        float $latitude,
        float $longitude,
        string $address
    ): Location {
        return DB::transaction(function () use (
            $location,
            $latitude,
            $longitude,
            $address
        ) {
            $location->update([
                'latitude' => $latitude,
                'longitude' => $longitude,
                'address' => $address,
            ]);

            return $location->refresh();
        });
    }

    public function delete(Location $location): void
    {
        DB::transaction(function () use ($location) {
            $location->delete();
        });
    }
}