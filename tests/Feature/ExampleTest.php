<?php

use App\Models\User;

test('root url redirects guest to login', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});

test('root url redirects authenticated user to dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('home'));

    $response->assertRedirect(route('dashboard'));
});
