import {STATUS_FOLLOWER, STATUS_LEADER, TYPE_LEADER_DEATH, TYPE_TAB_DEATH} from "./LeaderFollowerConst.ts";

let isLeader: boolean = false;
let isFollower: boolean = false;

const channel: BroadcastChannel = new BroadcastChannel("tab_leader_channel");
channel.onmessage = async (evt) => {
    if (evt.data.type === TYPE_LEADER_DEATH) {
        await tryToBecomeALeader();
    }
}

const onBecomingLeader = async () => {
    console.log("I am a leader,", new Date());
}

const onBecomingFollower = async () => {
    console.log("I am a follower,", new Date());
}

let releaseLock: () => void;
const tryToBecomeALeader = async () => {
    await navigator.locks.request("tab_leader", {
        ifAvailable: true,
        mode: "exclusive",
        steal: false,
    }, (lock) => {
        if (lock == null) {
            if (!isFollower) {
                isFollower = true;
                onBecomingFollower();
            }
            return undefined;
        }
        onBecomingLeader();
        isLeader = true;
        return new Promise(resolve => {
            // @ts-ignore
            releaseLock = resolve;
        });
    });
};

// sometimes a leader can die without notifying due to an outside reason, for ex. OOM
// run every 5 seconds (or lower based on your workflow) and try to become a leader
const activateSpinLock = () => setInterval(async () => {
    if (isLeader) {
        return;
    }
    await tryToBecomeALeader();
}, 5_000);

const init = async () => {
    await tryToBecomeALeader();
    activateSpinLock();
}

onmessage = (event) => {
    if (event.data?.type == TYPE_TAB_DEATH && isLeader) {
        releaseLock();
        channel.postMessage({
            type: TYPE_LEADER_DEATH,
        });
    }
};

init();
