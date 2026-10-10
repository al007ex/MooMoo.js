/*
 * moomoo.js loader — STORE  (owned / equipped hats + accessories)
 * ===============================================================
 * Hat swapping is the core of every combo in the bundle, and the bundle never
 * trusts its own sends: it keeps
 *   Nn  = hats you own          (free hats at spawn + every "5" buy reply)
 *   On  = accessories you own   (every "5" buy reply)
 *   $t  = hat you have on       (from the "5" equip reply only)
 *   Zt  = accessory you have on (from the "5" equip reply only)
 * and its equip(hat, acc) only sends when the target differs from what the
 * server last confirmed, and unequips (to 0) when you don't own the target.
 * This module keeps exactly that state from the wire and exposes the same
 * equip semantics, so a dropped or rejected store packet simply retries.
 *
 * Wire (server/src/network/packets.js):
 *   s2c "5" storeUpdate [action, id, isAccessory]   action 0 = bought, 1 = equipped
 *   c2s "c" store       [action, id, isAccessory]   through binding: vocabulary
 *                                                   store(0 = buy, 1 = equip)
 * The server gives you every hat with price 0 that isn't dontSell at spawn
 * (player.js), i.e. the bundle's starting Nn list.
 *
 * Part of the LOADER (volatile). Exposed on ctx as `ctx.store`.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooStore = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooStore = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const BUY = 0, EQUIP = 1;   // vocabulary store(action) values

    function createStore(env) {
        const MooMoo = env.MooMoo;
        const data = env.data;

        // Free hats in the bundle's order (its Nn initializer), which is also the
        // server's "price 0 and not dontSell" set.
        const FREE_HATS = data.hats.filter((h) => h.price <= 0 && !h.dontSell).map((h) => h.id);
        const FREE_TAILS = data.accessories.filter((a) => a.price <= 0 && !a.dontSell).map((a) => a.id);

        const ownedHats = FREE_HATS.slice();     // Nn
        const ownedTails = FREE_TAILS.slice();   // On
        let hat = null;                          // $t (null until the server confirms one)
        let tail = null;                         // Zt
        const listeners = new Set();
        const emit = (ev) => { for (const fn of Array.from(listeners)) { try { fn(ev); } catch (e) { /* ignore */ } } };

        // "5": exactly the bundle's Dp(e, t, n).
        function onStoreUpdate(p) {
            const a = p && p.args; if (!a) return;
            const action = a[0], id = a[1], isTail = !!a[2];
            if (action) {                                   // equipped
                if (isTail) tail = id; else hat = id;
                if (isTail) MooMoo.self.accessory = id; else MooMoo.self.hat = id;
            }
            if (action === 0 && id !== 0) {                 // bought
                if (isTail) { if (ownedTails.indexOf(id) < 0) ownedTails.push(id); }
                else if (ownedHats.indexOf(id) < 0) ownedHats.push(id);
            }
            emit({ action: action ? "equip" : "buy", id, isAccessory: isTail });
        }

        function reset() {
            ownedHats.length = 0; ownedHats.push(...FREE_HATS);
            ownedTails.length = 0; ownedTails.push(...FREE_TAILS);
            hat = null; tail = null;
        }

        const ownsHat = (id) => id === 0 || ownedHats.indexOf(id) >= 0;
        const ownsTail = (id) => id === 0 || ownedTails.indexOf(id) >= 0;

        // Raw store verbs (go through the vocabulary/binding).
        const equipHatRaw = (id) => MooMoo.send.store(EQUIP, id | 0, false);
        const equipTailRaw = (id) => MooMoo.send.store(EQUIP, id | 0, true);
        const buyHat = (id) => MooMoo.send.store(BUY, id | 0, false);
        const buyTail = (id) => MooMoo.send.store(BUY, id | 0, true);

        // The bundle's equip(hatId, accessoryId), 1-1:
        //   a null/NaN id leaves that slot alone;
        //   not owned -> unequip that slot (to 0) unless it's already bare;
        //   owned     -> equip it unless the server already has it on.
        function equip(hatId, accessoryId) {
            if (hatId === undefined) hatId = null;
            if (accessoryId === undefined) accessoryId = null;
            if (hatId !== null && !isNaN(hatId)) {
                if (ownedHats.indexOf(hatId) < 0) {
                    if (hat !== 0) equipHatRaw(0);
                } else if (hat !== hatId) {
                    equipHatRaw(hatId);
                }
            }
            if (accessoryId !== null && !isNaN(accessoryId)) {
                if (ownedTails.indexOf(accessoryId) < 0) {
                    if (tail !== 0) equipTailRaw(0);
                } else if (tail !== accessoryId) {
                    equipTailRaw(accessoryId);
                }
            }
        }

        MooMoo.on("storeUpdate", onStoreUpdate);

        return {
            get ownedHats() { return ownedHats; },       // Nn (live array)
            get ownedTails() { return ownedTails; },     // On (live array)
            get hat() { return hat; },                   // $t
            get tail() { return tail; },                 // Zt
            ownsHat, ownsTail,
            equip, equipHat: equipHatRaw, equipTail: equipTailRaw, buyHat, buyTail,
            onChange: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
            reset,
            // the bundle's "m" debug key set $t / Zt back to null: equip() then
            // re-sends whatever it is asked for next
            forgetEquipped: () => { hat = null; tail = null; },
            FREE_HATS, FREE_TAILS, BUY, EQUIP
        };
    }

    return { createStore, BUY, EQUIP };
});
