<?php

use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users with two factor enabled are redirected to two factor challenge', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create();

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    $response->assertSessionHas('login.id', $user->id);
    $this->assertGuest();
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect(route('home'));

    $this->assertGuest();
});

test('users are rate limited', function () {
    $user = User::factory()->create();

    RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertTooManyRequests();
});

test('admin can authenticate using username admin and password admin123', function () {
    User::factory()->create([
        'username' => 'admin',
        'email' => 'admin@sppd.local',
        'password' => 'admin123',
        'role' => 'admin',
    ]);

    $response = $this->post(route('login.store'), [
        'email' => 'admin',
        'password' => 'admin123',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('kepsek can authenticate using username kepsek and password kepsek123', function () {
    User::factory()->create([
        'username' => 'kepsek',
        'email' => 'atasan@sppd.local',
        'password' => 'kepsek123',
        'role' => 'atasan',
    ]);

    $response = $this->post(route('login.store'), [
        'email' => 'kepsek',
        'password' => 'kepsek123',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('bendahara can authenticate using username bendahara and password bendahara123', function () {
    User::factory()->create([
        'username' => 'bendahara',
        'email' => 'bendahara@sppd.local',
        'password' => 'bendahara123',
        'role' => 'bendahara',
    ]);

    $response = $this->post(route('login.store'), [
        'email' => 'bendahara',
        'password' => 'bendahara123',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('guru can authenticate using username guru and password guru123', function () {
    User::factory()->create([
        'username' => 'guru',
        'email' => 'pegawai@sppd.local',
        'password' => 'guru123',
        'role' => 'pegawai',
    ]);

    $response = $this->post(route('login.store'), [
        'email' => 'guru',
        'password' => 'guru123',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});
