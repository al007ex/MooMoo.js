// TRIBES (in-game alliances)
// Packets: g addTribe({sid, owner, clan}), 1 deleteTribe(sid), 2 joinRequest(sid, name),
//          3 setTribe(team, isOwner), 4 tribeMembers([sid, name, ...]),
//          A initData({teams: [{sid, owner, clan}, ...]}) on connect.
// A tribe named after its owner's clan is that clan's tribe (clan: true): the client
// offers its "Create" button to clan members and only lets that clan's members join.

export class ClanManager {

    constructor(players, server) {
        this.players = players;
        this.server = server;
        this.tribes = new Map();
    }

    // [{sid, owner, clan}] list for packet "A".
    list() {
        return [...this.tribes.values()].map(t => this.info(t));
    }

    info(tribe) {
        return tribe.clan ? { sid: tribe.sid, owner: tribe.owner.sid, clan: true } : { sid: tribe.sid, owner: tribe.owner.sid };
    }

    members(tribe) {
        return this.players.filter(p => p.team === tribe.sid);
    }

    sendMembers(tribe) {
        const members = this.members(tribe);
        const data = members.flatMap(p => [p.sid, p.name]);
        for (const member of members) member.send("4", data);
    }

    create(name, owner) {
        if (owner.team || this.tribes.has(name)) return false;
        const clan = !!owner.clanTag && name.toLowerCase() === String(owner.clanTag).toLowerCase();
        const tribe = { sid: clan ? owner.clanTag : name, owner, clan };
        if (this.tribes.has(tribe.sid)) return false;
        this.tribes.set(tribe.sid, tribe);
        owner.team = tribe.sid;
        owner.isOwner = true;
        owner.joinRequests.clear();
        this.server.broadcast("g", this.info(tribe));
        owner.send("3", tribe.sid, true);
        this.sendMembers(tribe);
        return true;
    }

    remove(name) {
        const tribe = this.tribes.get(name);
        if (!tribe) return;
        for (const member of this.members(tribe)) {
            member.team = null;
            member.isOwner = false;
            member.send("3", null, false);
        }
        tribe.owner.joinRequests.clear();
        this.tribes.delete(name);
        this.server.broadcast("1", name);
    }

    // "b": ask to join a tribe. A clan's tribe only takes that clan's members.
    requestJoin(player, name) {
        const tribe = this.tribes.get(name);
        if (!tribe || player.team || tribe.owner.joinRequests.has(player.sid)) return;
        if (tribe.clan && player.clanTag !== tribe.sid) return;
        tribe.owner.joinRequests.add(player.sid);
        tribe.owner.send("2", player.sid, player.name);
    }

    // "P": the owner accepts / declines a request.
    answerRequest(owner, sid, accept) {
        if (!owner.isOwner || !owner.team) return;
        const tribe = this.tribes.get(owner.team);
        if (!tribe || !owner.joinRequests.has(sid)) return;
        owner.joinRequests.delete(sid);
        if (!accept) return;
        const player = this.players.find(p => p.sid === sid);
        if (!player || player.team || (tribe.clan && player.clanTag !== tribe.sid)) return;
        player.team = tribe.sid;
        player.isOwner = false;
        player.send("3", tribe.sid, false);
        this.sendMembers(tribe);
    }

    // "Q": the owner kicks a member.
    kick(owner, sid) {
        if (!owner.isOwner || !owner.team || owner.sid === sid) return;
        const tribe = this.tribes.get(owner.team);
        const player = this.players.find(p => p.sid === sid && p.team === owner.team);
        if (!tribe || !player) return;
        this.leaveTribe(player);
    }

    // "N": leave (the owner leaving disbands the tribe).
    leaveTribe(player) {
        if (!player.team) return;
        const tribe = this.tribes.get(player.team);
        if (!tribe) {
            player.team = null;
            player.isOwner = false;
            return;
        }
        if (tribe.owner === player) {
            this.remove(tribe.sid);
            return;
        }
        player.team = null;
        player.isOwner = false;
        player.send("3", null, false);
        this.sendMembers(tribe);
    }

    // A player whose join request is pending disconnected.
    forget(player) {
        for (const tribe of this.tribes.values()) tribe.owner.joinRequests.delete(player.sid);
    }
}
