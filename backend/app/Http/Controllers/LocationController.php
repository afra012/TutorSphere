<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Services\LocationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LocationController extends Controller
{
    public function __construct(
        private LocationService $locationService
    ) {
    }

    private function checkUser(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        $role = strtolower($user->role);

        if (!in_array($role, ['student', 'teacher'])) {
            return response()->json([
                'message' => 'Only students and teachers can use locations.'
            ], 403);
        }

        return null;
    }

    private function syncProfileAddress($user, string $address): void
    {
        $table = strtolower($user->role) === 'teacher'
            ? 'teacher_profiles'
            : 'student_profiles';
        $column = strtolower($user->role) === 'teacher'
            ? 'location'
            : 'address';
        $profile = DB::table($table)->where('user_id', $user->id)->first();

        if ($profile) {
            DB::table($table)->where('user_id', $user->id)->update([
                $column => $address,
                'updated_at' => now(),
            ]);
            return;
        }

        DB::table($table)->insert([
            'user_id' => $user->id,
            $column => $address,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Get All Student & Teacher Locations
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $error = $this->checkUser($request);

        if ($error) {
            return $error;
        }

        $locations = DB::table('locations')
            ->join('users', 'users.id', '=', 'locations.user_id')
            ->whereIn('users.role', ['student', 'teacher'])
            ->select(
                'locations.id',
                'locations.user_id',
                'users.name',
                'users.role',
                'locations.latitude',
                'locations.longitude',
                'locations.address'
            )
            ->orderBy('users.name')
            ->get();

        return response()->json([
            'locations' => $locations
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Get Current Logged-in User Location
    |--------------------------------------------------------------------------
    */
    public function me(Request $request)
    {
        $error = $this->checkUser($request);

        if ($error) {
            return $error;
        }

        $location = Location::where(
            'user_id',
            $request->user()->id
        )->first();

        return response()->json([
            'location' => $location
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Location
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        $error = $this->checkUser($request);

        if ($error) {
            return $error;
        }

        $request->validate([
            'latitude' => [
                'required',
                'numeric',
                'between:-90,90',
            ],

            'longitude' => [
                'required',
                'numeric',
                'between:-180,180',
            ],

            'address' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $user = $request->user();

        $existingLocation = Location::where(
            'user_id',
            $user->id
        )->first();

        if ($existingLocation) {
            return response()->json([
                'message' => 'You already have a location. Use update instead.'
            ], 409);
        }

        $location = DB::transaction(function () use ($user, $request) {
            $location = $this->locationService->create(
                $user->id,
                (float) $request->latitude,
                (float) $request->longitude,
                $request->address
            );
            $this->syncProfileAddress($user, $request->address);
            return $location;
        });

        return response()->json([
            'message' => 'Location added successfully.',
            'location' => $location
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Own Location
    |--------------------------------------------------------------------------
    */
    public function update(
        Request $request,
        $id
    ) {
        $error = $this->checkUser($request);

        if ($error) {
            return $error;
        }

        $request->validate([
            'latitude' => [
                'required',
                'numeric',
                'between:-90,90',
            ],

            'longitude' => [
                'required',
                'numeric',
                'between:-180,180',
            ],

            'address' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $location = Location::find($id);

        if (!$location) {
            return response()->json([
                'message' => 'Location not found.'
            ], 404);
        }

        if (
            (int) $location->user_id !==
            (int) $request->user()->id
        ) {
            return response()->json([
                'message' => 'You can only update your own location.'
            ], 403);
        }

        $location = DB::transaction(function () use ($location, $request) {
            $location = $this->locationService->update(
                $location,
                (float) $request->latitude,
                (float) $request->longitude,
                $request->address
            );
            $this->syncProfileAddress($request->user(), $request->address);
            return $location;
        });

        return response()->json([
            'message' => 'Location updated successfully.',
            'location' => $location
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Own Location
    |--------------------------------------------------------------------------
    */
    public function destroy(
        Request $request,
        $id
    ) {
        $error = $this->checkUser($request);

        if ($error) {
            return $error;
        }

        $location = Location::find($id);

        if (!$location) {
            return response()->json([
                'message' => 'Location not found.'
            ], 404);
        }

        if (
            (int) $location->user_id !==
            (int) $request->user()->id
        ) {
            return response()->json([
                'message' => 'You can only delete your own location.'
            ], 403);
        }

        $this->locationService->delete($location);

        return response()->json([
            'message' => 'Location deleted successfully.'
        ]);
    }
}
