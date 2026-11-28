### How to Push a Release:

```bash
./deploy/release.sh "commit message" <patch|minor|major>
```

This will do the following in one sweep (in this order):

- Convert all sub-upgrades writted in YAML under `dev/yml/subUpgrades` to JSON for Prod
- Generate an updated PDF of the sub-upgrades in `dev/outputs/subUpgrades.pdf`
- Count LOC (Lines of Code) in dev and prod environments, writes the data to `src/data/loc.json`, creates a png and svg visualization of the data in `dev/outputs/loc_visualization.png` and `dev/outputs/loc_visualization.svg`
- Bump the version number based on the specified type (patch, minor, or major)
- Push changes to the remote repository with the given commit message

# subUpgrades:

[View subUpgrades.pdf](dev/outputs/subUpgrades.pdf)

### Upgrades:

- Pats
- (Dry) Cat Food
- (Wet) Cat Food
- Yogurt Tubes
- Water Bowl
- Water Fountain
- Mouse Toy
- Crinkle Ball
- Wand Toy
- Laser Pointer
- Cat Bed
- Scratching Post
- Cat Tree
- Catio
- Litter Box
- Litter Robot
- Catnip
- Paper Bag
- Human Bed
- Cardboard Box