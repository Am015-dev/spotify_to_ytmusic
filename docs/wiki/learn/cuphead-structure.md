# Cuphead recreation (Unity, MIT): how the repo is organised

Source: github.com/JulianBiancardi/cuphead (MIT, Copyright 2023 JulianBiancardi), read at commit d250da7 (shallow clone).
Use it for ORGANISATION only. Its art and music are Cuphead's (StudioMDHR): never copy them.
Code may be ported with an MIT header and attribution, but it is Unity C#, so port ideas, not files.

## Layout (Assets/)
- Top level: shared base classes. Damageable (health + OnDamage/OnDeath events), Enemy, Destructible, DamageDealer, IObservable/IObserver.
- Player/: state machine. PlayerStateManager switches PlayerGroundState / PlayerJumpState / PlayerCrouchState; all extend State (Enter, UpdateState, Exit, OnJump). Weapon and ship in Player/Weapon, ShipController.
- TheRootPack/<Boss>/: one folder per boss (OllieBulb, ChaunceyChanteny, SalSpudder) with its attacks in subfolders (Projectiles, Tears) and its death script next to it.
- TheRootPack/LevelManager.cs and EnemyHealth.cs: level flow and shared enemy health.
- UI/: HealthUI, SuperUI, DeathCard/.
- Camera/: CameraShake.
- Scenes/: LoaderManager, AudioManager, MainMenuLevelManager; one .unity scene per level (Title, MainMenu, Loading, Tutorial, TheRootPack, Win).
- Asset folders mirror the entity: TheRootPack/Ollie Bulb/Body/Idle, /Body/Death, and so on.

## Lessons for us
- One folder per level or city, with its own scripts and assets together (our xc/ + models/ split is similar, but flatter).
- A shared base for anything that takes damage (cars, rivals, props) with OnDamage/OnDeath events, not per-type checks.
- A small state machine per mode (ground / jump / crouch) instead of flags, for on-foot and vehicle modes.
- Scene per level (Loading, Tutorial, Win): a clean split between the level and the shell around it.

Not transferable: 2D sprites, Unity physics and URP rendering. The three.js/WebGL game is 3D.

Related: [stk.md](stk.md) (SuperTuxKart, GPL-3, ported camera), [../sources/licences.md](../sources/licences.md).
