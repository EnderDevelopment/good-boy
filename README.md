# Good Boy Minecraft Bedrock Horror Add-on

Good Boy is a Minecraft Bedrock horror add-on that adds a persistent Minecraft wolf, daily feeding, buried treasure digging spots, random loot, a demonic hunger state, wolf attacks, and a death jumpscare inspired by the Good Boy game.

## Install

1. Copy the `buried-good-boy` folder into your `development_behavior_packs` folder.
2. Create or open a Minecraft Bedrock world.
3. Open the world settings and activate the **Buried Good Boy** behavior pack.
4. Enable the required Creator or Beta API experiment if Minecraft requests it.
5. Enter the world. Good Boy will spawn near the first player.

To distribute the add-on as an `.mcpack` file, zip the contents of the `buried-good-boy` folder with `manifest.json` at the archive root, then change the file extension from `.zip` to `.mcpack`.

## Use

1. Find Good Boy near the first player after entering the world.
2. Feed the dog five pieces of supported raw meat during each Minecraft day.
3. Hold supported raw meat in your hotbar and interact with Good Boy. Feeding consumes one item from the selected hotbar slot.
4. Look for gravel digging spots that appear around the dog.
5. Break a digging spot to receive one random item from the add-on's treasure pool.
6. If Good Boy receives fewer than five feedings during a Minecraft day, its hunger decreases.
7. When hunger reaches 10, Good Boy becomes demonic, growls, warns players, and attacks nearby players.
8. If the dog kills you, a red death message, sound effect, blindness effect, and jumpscare title play.
9. After you respawn, Good Boy returns to its normal state and its hunger is set to 50.

Supported feeding items are raw chicken, beef, raw porkchop, and raw mutton. Cooked meat is not accepted.

The treasure pool includes diamonds, gold ingots, iron ingots, emeralds, apples, bread, golden apples, ender pearls, arrows, obsidian, coal, redstone, lapis lazuli, amethyst shards, and experience bottles.

Files included:

- `manifest.json`: Add-on metadata and script dependency.
- `scripts/main.js`: Dog spawning, feeding, hunger, digging spots, treasure, demonic attacks, respawn behavior, and jumpscare logic.

This is a Minecraft Bedrock behavior pack with JavaScript scripting. It is not a Java Edition mod and does not require Gradle.

---

More Minecraft mod projects by EnderDevelopment: https://github.com/EnderDevelopment

Project page: https://dash.enderdevelopment.com/community/f93df7c6-19ab-47f2-aef3-f6fa65f953aa?utm_source=github&utm_medium=readme&utm_campaign=auto_publish&utm_content=f93df7c6-19ab-47f2-aef3-f6fa65f953aa
