// AI MANAGER
// Animal types copied entry-for-entry from the official client bundle ([hu].aiTypes).
// The array index is the "index" the client receives in packet "I".

import { AI } from "./ai.js";

export const AI_TYPES = [{
            id: 0,
            src: "cow_1",
            killScore: 150,
            health: 500,
            weightM: 0.8,
            speed: 0.00095,
            turnSpeed: 0.001,
            scale: 72,
            drop: ["food",50]
        }, {
            id: 1,
            src: "pig_1",
            killScore: 200,
            health: 800,
            weightM: 0.6,
            speed: 0.00085,
            turnSpeed: 0.001,
            scale: 72,
            drop: ["food",80]
        }, {
            id: 2,
            name: "Bull",
            src: "bull_2",
            hostile: true,
            dmg: 20,
            killScore: 1000,
            health: 1800,
            weightM: 0.5,
            speed: 0.00094,
            turnSpeed: 0.00074,
            scale: 78,
            viewRange: 800,
            chargePlayer: true,
            drop: ["food",100]
        }, {
            id: 3,
            name: "Bully",
            src: "bull_1",
            hostile: true,
            dmg: 20,
            killScore: 2000,
            health: 2800,
            weightM: 0.45,
            speed: 0.001,
            turnSpeed: 0.0008,
            scale: 90,
            viewRange: 900,
            chargePlayer: true,
            drop: ["food",400]
        }, {
            id: 4,
            name: "Wolf",
            src: "wolf_1",
            hostile: true,
            dmg: 8,
            killScore: 500,
            health: 300,
            weightM: 0.45,
            speed: 0.001,
            turnSpeed: 0.002,
            scale: 84,
            viewRange: 800,
            chargePlayer: true,
            drop: ["food",200]
        }, {
            id: 5,
            name: "Quack",
            src: "chicken_1",
            dmg: 8,
            killScore: 2000,
            noTrap: true,
            health: 300,
            weightM: 0.2,
            speed: 0.0018,
            turnSpeed: 0.006,
            scale: 70,
            drop: ["food",100]
        }, {
            id: 6,
            name: "MOOSTAFA",
            nameScale: 50,
            src: "enemy",
            hostile: true,
            dontRun: true,
            fixedSpawn: true,
            spawnDelay: 60000,
            noTrap: true,
            colDmg: 100,
            dmg: 40,
            killScore: 8000,
            health: 18000,
            weightM: 0.4,
            speed: 0.0007,
            turnSpeed: 0.01,
            scale: 80,
            spriteMlt: 1.8,
            leapForce: 0.9,
            viewRange: 1000,
            hitRange: 210,
            hitDelay: 1000,
            chargePlayer: true,
            drop: ["food",100]
        }, {
            id: 7,
            name: "Treasure",
            hostile: true,
            nameScale: 35,
            src: "crate_1",
            fixedSpawn: true,
            spawnDelay: 120000,
            colDmg: 200,
            killScore: 5000,
            health: 20000,
            weightM: 0.1,
            speed: 0,
            turnSpeed: 0,
            scale: 70,
            spriteMlt: 1
        }, {
            id: 8,
            name: "MOOFIE",
            src: "wolf_2",
            hostile: true,
            fixedSpawn: true,
            dontRun: true,
            hitScare: 4,
            spawnDelay: 30000,
            noTrap: true,
            nameScale: 35,
            dmg: 10,
            colDmg: 100,
            killScore: 3000,
            health: 7000,
            weightM: 0.45,
            speed: 0.0015,
            turnSpeed: 0.002,
            scale: 90,
            viewRange: 800,
            chargePlayer: true,
            drop: ["food",1000]
        }, {
            id: 9,
            name: "Boar",
            src: "boar_1",
            hostile: true,
            dmg: 14,
            killScore: 800,
            health: 900,
            weightM: 0.55,
            speed: 0.00105,
            turnSpeed: 0.0012,
            scale: 76,
            viewRange: 700,
            chargePlayer: true,
            drop: ["food",150]
        }, {
            id: 10,
            name: "Yeti",
            src: "yeti_1",
            hostile: true,
            dmg: 25,
            killScore: 4500,
            health: 3200,
            weightM: 0.35,
            speed: 0.0008,
            turnSpeed: 0.0008,
            scale: 95,
            viewRange: 750,
            leapForce: 0.6,
            chargePlayer: true,
            drop: ["food",800]
        }, {
            id: 11,
            name: "Crab King",
            src: "crab_1",
            boss: true,
            hostile: true,
            dontRun: true,
            fixedSpawn: true,
            noTrap: true,
            dmg: 45,
            killScore: 4000,
            health: 480000,
            weightM: 0,
            speed: 0.00045,
            turnSpeed: 0.0007,
            scale: 280,
            viewRange: 1800,
            hitRange: 400,
            hitDelay: 700
        }, {
            id: 12,
            src: "sheep_1",
            killScore: 200,
            health: 650,
            weightM: 0.7,
            speed: 0.0009,
            turnSpeed: 0.001,
            scale: 72,
            drop: ["food",150]
        }, {
            id: 13,
            name: "Crab",
            src: "crab_1",
            diver: true,
            hostile: true,
            noTrap: true,
            dmg: 14.4,
            killScore: 400,
            health: 500,
            weightM: 0.5,
            speed: 0.0014,
            turnSpeed: 0.003,
            scale: 78,
            viewRange: 4000,
            chargePlayer: true
        }, {
            id: 14,
            name: "Crabling",
            src: "crab_1",
            diver: true,
            hostile: true,
            noTrap: true,
            dmg: 6,
            killScore: 200,
            health: 250,
            weightM: 0.5,
            speed: 0.0017,
            turnSpeed: 0.004,
            scale: 39,
            viewRange: 4000,
            chargePlayer: true
        }];

export class AiManager {
    constructor(ais, players, items, objectManager, config, UTILS, scoreCallback, server, hooks) {
        this.aiTypes = AI_TYPES;

        // SPAWN AI:
        this.spawn = function (x, y, dir, index, overrides) {
            if (!this.aiTypes[index]) {
                console.error("missing ai type", index);
                return this.spawn(x, y, dir, 0);
            }
            let tmpObj;
            for (let i = 0; i < ais.length; ++i) {
                if (!ais[i].active) {
                    tmpObj = ais[i];
                    break;
                }
            }
            if (!tmpObj) {
                tmpObj = new AI(ais.length, objectManager, players, items, UTILS, config, scoreCallback, server, hooks);
                ais.push(tmpObj);
            }
            tmpObj.init(x, y, dir, index, this.aiTypes[index]);
            if (overrides) Object.assign(tmpObj, overrides);
            return tmpObj;
        };
    }
}
