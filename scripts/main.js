import { world, system, ItemStack } from "@minecraft/server";

const DOG_TAG = "buried_good_boy";
const DEMON_TAG = "buried_good_boy_demon";
const HUNGER_OBJECTIVE = "bgb_hunger";
const FED_OBJECTIVE = "bgb_fed";
const DAY_TICKS = 24000;
const FEED_ITEMS = new Set(["minecraft:raw_chicken", "minecraft:beef", "minecraft:raw_porkchop", "minecraft:mutton"]);
const LOOT = ["minecraft:diamond", "minecraft:gold_ingot", "minecraft:iron_ingot", "minecraft:emerald", "minecraft:apple", "minecraft:bread", "minecraft:golden_apple", "minecraft:ender_pearl", "minecraft:arrow", "minecraft:obsidian", "minecraft:coal", "minecraft:redstone", "minecraft:lapis_lazuli", "minecraft:amethyst_shard", "minecraft:experience_bottle"];
const spots = new Map();
let ticks = 0;

function objective(id, display) {
  return world.scoreboard.getObjective(id) ?? world.scoreboard.addObjective(id, display);
}

function score(id, participant, fallback) {
  const value = objective(id, id).getScore(participant);
  return value === undefined ? fallback : value;
}

function setScore(id, participant, value) {
  objective(id, id).setScore(participant, value);
}

function dog() {
  const overworld = world.getDimension("overworld");
  return overworld.getEntities({ type: "minecraft:wolf", tags: [DOG_TAG] })[0];
}

function ensureDog() {
  const existing = dog();
  if (existing) return existing;
  const player = world.getPlayers()[0];
  if (!player) return undefined;
  const entity = player.dimension.spawnEntity("minecraft:wolf", { x: player.location.x + 2, y: player.location.y, z: player.location.z + 2 });
  entity.addTag(DOG_TAG);
  entity.nameTag = "Good Boy";
  setScore(HUNGER_OBJECTIVE, DOG_TAG, 100);
  setScore(FED_OBJECTIVE, DOG_TAG, 0);
  return entity;
}

function inventoryItem(player) {
  const inventory = player.getComponent("minecraft:inventory")?.container;
  if (!inventory) return undefined;
  return { inventory, slot: player.selectedSlotIndex, stack: inventory.getItem(player.selectedSlotIndex) };
}

function feed(player) {
  const held = inventoryItem(player);
  if (!held?.stack || !FEED_ITEMS.has(held.stack.typeId)) return false;
  const hunger = Math.min(100, score(HUNGER_OBJECTIVE, DOG_TAG, 100) + 2);
  setScore(HUNGER_OBJECTIVE, DOG_TAG, hunger);
  setScore(FED_OBJECTIVE, DOG_TAG, score(FED_OBJECTIVE, DOG_TAG, 0) + 1);
  if (held.stack.amount === 1) held.inventory.setItem(held.slot, undefined);
  else held.inventory.setItem(held.slot, new ItemStack(held.stack.typeId, held.stack.amount - 1));
  player.sendMessage("§aGood Boy enjoyed the raw meat.");
  const entity = dog();
  if (entity?.hasTag(DEMON_TAG) && hunger > 10) {
    entity.removeTag(DEMON_TAG);
    entity.nameTag = "Good Boy";
    player.sendMessage("§fThe dog looks normal again.");
  }
  return true;
}

function createSpot(entity) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 5 + Math.floor(Math.random() * 8);
  const x = Math.floor(entity.location.x + Math.cos(angle) * distance);
  const z = Math.floor(entity.location.z + Math.sin(angle) * distance);
  const y = Math.floor(entity.dimension.getTopmostBlock({ x, z }).location.y + 1);
  const key = `${x},${y},${z}`;
  if (spots.has(key)) return;
  entity.dimension.getBlock({ x, y, z })?.setType("minecraft:gravel");
  spots.set(key, { dimension: entity.dimension, x, y, z });
}

function digSpot(event) {
  const block = event.block;
  const key = `${Math.floor(block.location.x)},${Math.floor(block.location.y)},${Math.floor(block.location.z)}`;
  if (!spots.has(key)) return;
  spots.delete(key);
  const item = LOOT[Math.floor(Math.random() * LOOT.length)];
  event.dimension.runCommand(`give ${event.player.name} ${item} 1`);
  event.player.sendMessage(`§6You dug up: §f${item.replace("minecraft:", "")}`);
}

function makeDemonic(entity) {
  if (entity.hasTag(DEMON_TAG)) return;
  entity.addTag(DEMON_TAG);
  entity.nameTag = "§4Demonic Good Boy";
  entity.dimension.playSound("mob.wolf.growl", entity.location);
  for (const player of world.getPlayers()) player.sendMessage("§4Good Boy is starving. Run.");
}

function attackNearby(entity) {
  for (const player of world.getPlayers()) {
    const dx = player.location.x - entity.location.x;
    const dy = player.location.y - entity.location.y;
    const dz = player.location.z - entity.location.z;
    if (dx * dx + dy * dy + dz * dz > 36 || Math.abs(dy) > 3) continue;
    player.applyDamage(4, { cause: "entityAttack", damagingEntity: entity });
    entity.dimension.playSound("mob.wolf.growl", entity.location);
  }
}

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  if (event.target.hasTag(DOG_TAG)) feed(event.player);
});
world.beforeEvents.playerBreakBlock.subscribe(digSpot);
world.afterEvents.entityDie.subscribe((event) => {
  const player = event.deadEntity;
  const killer = event.damageSource?.damagingEntity;
  if (player.typeId !== "minecraft:player" || !killer?.hasTag(DOG_TAG)) return;
  player.onScreenDisplay.setTitle("§4GOOD BOY FOUND YOU", { subtitle: "§cIt was hungry.", fadeInDuration: 0, stayDuration: 60, fadeOutDuration: 20 });
  player.playSound("mob.warden.sonic_boom");
  player.addEffect("blindness", 60, { amplifier: 2, showParticles: false });
  player.sendMessage("§4The dog ate you. Feed it after you respawn.");
});
world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) {
    setScore(HUNGER_OBJECTIVE, DOG_TAG, 50);
    setScore(FED_OBJECTIVE, DOG_TAG, 0);
    const entity = dog();
    if (entity?.hasTag(DEMON_TAG)) {
      entity.removeTag(DEMON_TAG);
      entity.nameTag = "Good Boy";
    }
  }
});

system.runInterval(() => {
  ticks += 20;
  const entity = ensureDog();
  if (!entity) return;
  if (ticks % 600 === 0) createSpot(entity);
  if (ticks % DAY_TICKS === 0) {
    const fed = score(FED_OBJECTIVE, DOG_TAG, 0);
    setScore(HUNGER_OBJECTIVE, DOG_TAG, Math.max(10, score(HUNGER_OBJECTIVE, DOG_TAG, 100) - (fed >= 5 ? 0 : 10)));
    setScore(FED_OBJECTIVE, DOG_TAG, 0);
  }
  if (score(HUNGER_OBJECTIVE, DOG_TAG, 100) <= 10) {
    makeDemonic(entity);
    attackNearby(entity);
  }
}, 20);
