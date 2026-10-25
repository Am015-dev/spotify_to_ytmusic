# MIT 2D run-and-gun recreation (Unity): how the repo is organised

Source: MIT-licensed 2D run-and-gun recreation by JulianBiancardi (Copyright 2023), read at commit d250da7 (shallow clone). Repo link kept with the owner.
Use it for ORGANISATION only. Its art, animation, sprites and music are not ours to copy. Code may be ported
with its MIT header and attribution, but it is Unity C#, so port ideas, not files.

## Layout (Assets/)
- Top level: shared base classes. Damageable (health + OnDamage/OnDeath events), Enemy, Destructible, DamageDealer, IObservable/IObserver.
- Player/: state machine. PlayerStateManager switches PlayerGroundState / PlayerJumpState / PlayerCrouchState; all extend State (Enter, UpdateState, Exit, OnJump). Weapon and ship in Player/Weapon, ShipController.
- One folder per boss under the level folder, with its attacks in subfolders (Projectiles, Tears) and its death script next to it.
- Level flow (LevelManager) and shared enemy health (EnemyHealth) sit beside the level folder.
- UI/: HealthUI, SuperUI, DeathCard/.
- Camera/: CameraShake.
- Scenes/: LoaderManager, AudioManager, MainMenuLevelManager; one scene file per level (Title, MainMenu, Loading, Tutorial, Level, Win).
- Asset folders mirror the entity: <Boss>/Body/Idle, /Body/Death, and so on.

## Lessons for us
- One folder per level or city, with its own scripts and assets together (our xc/ + models/ split is similar, but flatter).
- A shared base for anything that takes damage (cars, rivals, props) with OnDamage/OnDeath events, not per-type checks.
- A small state machine per mode (ground / jump / crouch) instead of flags, for on-foot and vehicle modes.
- Scene per level (Loading, Tutorial, Win): a clean split between the level and the shell around it.

Not transferable: 2D sprites, Unity physics and URP rendering. Our 3D game (Overdrive) is not 2D.
